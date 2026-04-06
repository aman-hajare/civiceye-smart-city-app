from rest_framework import viewsets, permissions, serializers, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .websocket import send_realtime_notification
from .utils.ai_validator import predict_issue_image, AIValidationError
import math

from .models import Issue, User, Notification
from .serializers import IssueSerializer, RegisterUserSerializer


# USER VIEWSET

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'full_name']

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": full_name,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED
        )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        if role:
            return User.objects.filter(role=role)
        return User.objects.all()


# ISSUE VIEWSET (CLEAN ROLE-BASED LOGIC)

class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'priority_score']

    @staticmethod
    def _normalize_category(value):
        normalized = str(value).strip().lower().replace("_", "")
        aliases = {
            "streetlight": "streetlight",
            "water": "other",
        }
        return aliases.get(normalized, normalized)

    def _notify_users(self, users, message):
        for target_user in users:
            notification = Notification.objects.create(
                user=target_user,
                message=message
            )
            send_realtime_notification(target_user.id, notification)

    # ROLE BASED QUERYSET
    def get_queryset(self):
        user = self.request.user

        if user.role == 'ADMIN':
            return Issue.objects.all().order_by('-created_at')

        elif user.role == 'WORKER':
            return Issue.objects.filter(assigned_to=user).order_by('-created_at')

        return Issue.objects.filter(reported_by=user).order_by('-created_at')

    # CREATE ISSUE (USER ONLY)
    def perform_create(self, serializer):
        if self.request.user.role != "USER":
            raise PermissionDenied("Only users can report issues.")

        image_file = serializer.validated_data.get("image")
        selected_category = self._normalize_category(serializer.validated_data.get("category"))

        ai_prediction = ""
        ai_confidence = None

        if not image_file:
            raise serializers.ValidationError({"image": "Issue image is required."})

        try:
            ai_prediction, ai_confidence = predict_issue_image(image_file)
        except AIValidationError as exc:
            raise serializers.ValidationError({"image": str(exc)})

        if ai_confidence < 0.6:
            raise serializers.ValidationError(
                {"image": "Low confidence image, please upload a clear image"}
            )

        if ai_prediction != selected_category:
            raise serializers.ValidationError(
                {"image": "Image does not match selected category"}
            )

        priority = self.calculate_priority(
            category=serializer.validated_data.get("category"),
            status="PENDING"
        )

        issue = serializer.save(
            reported_by=self.request.user,
            priority_score=priority,
            ai_prediction=ai_prediction,
            ai_confidence=ai_confidence,
        )

        # Notify all admins when a new issue is reported.
        admins = User.objects.filter(role="ADMIN")
        self._notify_users(
            admins,
            f"New issue reported by {self.request.user.username}: {issue.title}"
        )

    # UPDATE ISSUE
    def update(self, request, *args, **kwargs):
        issue = self.get_object()
        user = request.user

        # ADMIN: can assign worker
        if user.role == "ADMIN":
            previous_assigned = issue.assigned_to
            previous_status = issue.status
            response = super().update(request, *args, **kwargs)
            issue.refresh_from_db()

            # Notify worker on assignment
            if "assigned_to" in request.data or "assigned_to_id" in request.data:
                new_worker = issue.assigned_to
                if new_worker and new_worker != previous_assigned:
                    self._notify_users(
                        [new_worker],
                        f"You have been assigned issue: {issue.title}"
                    )

            # Admin confirms resolution -> notify reporter
            if issue.status == "RESOLVED" and previous_status != "RESOLVED":
                self._notify_users(
                    [issue.reported_by],
                    f"Your issue '{issue.title}' has been resolved by admin."
                )

            issue.priority_score = self.calculate_priority(issue.category, issue.status)
            issue.save(update_fields=["priority_score"])

            return response

        # WORKER: can only update status
        elif user.role == "WORKER":
            if issue.assigned_to != user:
                raise PermissionDenied("You are not assigned to this issue.")

            new_status = request.data.get("status")
            previous_status = issue.status

            if new_status not in ["IN_PROGRESS", "COMPLETED"]:
                raise PermissionDenied("Invalid status update.")

            if new_status == previous_status:
                return Response(IssueSerializer(issue, context={"request": request}).data)

            issue.status = new_status
            issue.priority_score = self.calculate_priority(issue.category, new_status)
            issue.save(update_fields=["status", "priority_score"])

            if new_status == "COMPLETED":
                admins = User.objects.filter(role="ADMIN")
                self._notify_users(
                    admins,
                    f"Worker {user.username} marked issue '{issue.title}' as COMPLETED"
                )

            return Response(IssueSerializer(issue, context={"request": request}).data)

        # USER cannot update
        raise PermissionDenied("You cannot update this issue.")

    @action(detail=True, methods=["post"], url_path="request-resolve")
    def request_resolve(self, request, pk=None):
        issue = self.get_object()
        user = request.user

        if user.role != "WORKER":
            raise PermissionDenied("Only workers can request resolution.")

        if issue.assigned_to != user:
            raise PermissionDenied("You are not assigned to this issue.")

        if issue.status == "RESOLVED":
            return Response({"detail": "Issue is already resolved."}, status=status.HTTP_400_BAD_REQUEST)

        if issue.status == "COMPLETED":
            return Response({"detail": "Issue is already marked COMPLETED."}, status=status.HTTP_200_OK)

        issue.status = "COMPLETED"
        issue.priority_score = self.calculate_priority(issue.category, "COMPLETED")
        issue.save(update_fields=["status", "priority_score"])

        admins = User.objects.filter(role="ADMIN")
        self._notify_users(
            admins,
            f"Worker {user.username} marked issue '{issue.title}' as COMPLETED"
        )

        return Response({"detail": "Issue marked as COMPLETED and admins notified."}, status=status.HTTP_200_OK)

    # PRIORITY LOGIC
    def calculate_priority(self, category, status):
        category_priority = {
            'POTHOLE': 8,
            'GARBAGE': 6,
            'STREETLIGHT': 5,
            'WATER': 7,
            'TRAFFIC': 9,
            'OTHER': 3,
        }

        base = category_priority.get(category, 1)

        if status == "PENDING":
            return base + 2
        elif status == "IN_PROGRESS":
            return base + 1
        elif status == "COMPLETED":
            return 1
        return 0


# DASHBOARD STATS (ADMIN ONLY)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "ADMIN":
            raise PermissionDenied("Only admin can view dashboard.")

        return Response({
            "total": Issue.objects.count(),
            "pending": Issue.objects.filter(status='PENDING').count(),
            "in_progress": Issue.objects.filter(status='IN_PROGRESS').count(),
            "completed": Issue.objects.filter(status='COMPLETED').count(),
            "resolved": Issue.objects.filter(status='RESOLVED').count(),
            "issues_by_category": Issue.objects.values('category').annotate(count=Count('category')),
            "issues_by_status": Issue.objects.values('status').annotate(count=Count('status')),
        })


# NEARBY ISSUES

class NearbyIssuesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user_lat = float(request.query_params.get('lat'))
            user_lng = float(request.query_params.get('lng'))
            radius = float(request.query_params.get('radius', 5))
        except (TypeError, ValueError):
            return Response({"error": "Invalid parameters"}, status=400)

        issues = Issue.objects.all()
        nearby = []

        for issue in issues:
            distance = self.haversine(
                user_lat, user_lng,
                issue.latitude, issue.longitude
            )
            if distance <= radius:
                nearby.append(issue)

        return Response(IssueSerializer(nearby, many=True).data)

    def haversine(self, lat1, lon1, lat2, lon2):
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)

        a = (
            math.sin(dlat / 2) ** 2 +
            math.cos(math.radians(lat1)) *
            math.cos(math.radians(lat2)) *
            math.sin(dlon / 2) ** 2
        )

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c


# NOTIFICATIONS

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"unread_count": count})

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def partial_update(self, request, *args, **kwargs):
        notification = self.get_object()

        if notification.user != request.user:
            raise PermissionDenied("You cannot modify this notification.")

        return super().partial_update(request, *args, **kwargs)
