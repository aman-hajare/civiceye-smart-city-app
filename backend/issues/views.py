from rest_framework import viewsets, permissions, serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
import math

from .models import Issue, User, Notification
from .serializers import IssueSerializer


# ==============================
# USER VIEWSET
# ==============================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get('role')

        if role:
            return User.objects.filter(role=role)

        return User.objects.all()


# ==============================
# ISSUE VIEWSET
# ==============================

class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'priority_score']

    def get_queryset(self):
        user = self.request.user

        if user.role == 'ADMIN':
            return Issue.objects.all().order_by('-created_at')

        elif user.role == 'WORKER':
            return Issue.objects.filter(assigned_to=user)

        else:
            return Issue.objects.filter(reported_by=user)

    def perform_create(self, serializer):
        category_priority = {
            'POTHOLE': 8,
            'GARBAGE': 6,
            'STREETLIGHT': 5,
            'WATER': 7,
            'TRAFFIC': 9,
            'OTHER': 3,
        }

        category = serializer.validated_data.get('category')
        base_score = category_priority.get(category, 1)

        priority = base_score + 2  # new issue is PENDING

        serializer.save(
            reported_by=self.request.user,
            priority_score=priority
        )

    def update(self, request, *args, **kwargs):
        issue = self.get_object()

        if request.user.role != 'ADMIN':
            raise PermissionDenied("Only admin can update issue.")

        previous_assigned = issue.assigned_to

        response = super().update(request, *args, **kwargs)

        issue.refresh_from_db()

        # ======================
        # NOTIFICATION ON ASSIGN
        # ======================
        if 'assigned_to' in request.data:
            new_assigned = issue.assigned_to

            if new_assigned and new_assigned != previous_assigned:
                Notification.objects.create(
                    user=new_assigned,
                    message=f"You have been assigned issue: {issue.title}"
                )

        # ======================
        # RECALCULATE PRIORITY
        # ======================
        category_priority = {
            'POTHOLE': 8,
            'GARBAGE': 6,
            'STREETLIGHT': 5,
            'WATER': 7,
            'TRAFFIC': 9,
            'OTHER': 3,
        }

        base_score = category_priority.get(issue.category, 1)

        if issue.status == 'PENDING':
            issue.priority_score = base_score + 2
        elif issue.status == 'IN_PROGRESS':
            issue.priority_score = base_score + 1
        else:
            issue.priority_score = 0

        issue.save()

        return response


# ==============================
# DASHBOARD STATS
# ==============================

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            raise PermissionDenied("Only admin can view dashboard statistics.")

        total_issues = Issue.objects.count()
        pending = Issue.objects.filter(status='PENDING').count()
        in_progress = Issue.objects.filter(status='IN_PROGRESS').count()
        resolved = Issue.objects.filter(status='RESOLVED').count()

        category_data = (
            Issue.objects.values('category')
            .annotate(count=Count('category'))
        )

        status_data = (
            Issue.objects.values('status')
            .annotate(count=Count('status'))
        )

        return Response({
            "total_issues": total_issues,
            "pending": pending,
            "in_progress": in_progress,
            "resolved": resolved,
            "issues_by_category": category_data,
            "issues_by_status": status_data
        })


# ==============================
# NEARBY ISSUES
# ==============================

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
        nearby_issues = []

        for issue in issues:
            distance = self.haversine(
                user_lat, user_lng,
                issue.latitude, issue.longitude
            )
            if distance <= radius:
                nearby_issues.append(issue)

        serializer = IssueSerializer(nearby_issues, many=True)
        return Response(serializer.data)

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


# ==============================
# NOTIFICATION VIEWSET
# ==============================

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def partial_update(self, request, *args, **kwargs):
        notification = self.get_object()

        if notification.user != request.user:
            raise PermissionDenied("You cannot modify this notification.")

        return super().partial_update(request, *args, **kwargs)
