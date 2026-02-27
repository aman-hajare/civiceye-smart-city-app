from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Issue, Notification, User


class IssueNotificationFlowTests(APITestCase):
    def setUp(self):
        self.admin_1 = User.objects.create_user(
            username="admin1",
            password="pass1234",
            role="ADMIN",
        )
        self.admin_2 = User.objects.create_user(
            username="admin2",
            password="pass1234",
            role="ADMIN",
        )
        self.worker = User.objects.create_user(
            username="worker1",
            password="pass1234",
            role="WORKER",
        )
        self.reporter = User.objects.create_user(
            username="user1",
            password="pass1234",
            role="USER",
        )

        self.issues_url = reverse("issues-list")

    @patch("issues.views.send_realtime_notification")
    def test_new_issue_by_user_notifies_all_admins(self, mock_realtime):
        self.client.force_authenticate(user=self.reporter)
        payload = {
            "title": "Road damage",
            "description": "Deep pothole on main road",
            "category": "POTHOLE",
            "latitude": 22.72,
            "longitude": 75.86,
        }

        response = self.client.post(self.issues_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        admin_notifications = Notification.objects.filter(
            user__in=[self.admin_1, self.admin_2]
        )
        self.assertEqual(admin_notifications.count(), 2)
        self.assertEqual(mock_realtime.call_count, 2)

    @patch("issues.views.send_realtime_notification")
    def test_admin_assignment_notifies_assigned_worker(self, mock_realtime):
        issue = Issue.objects.create(
            title="Broken street light",
            description="Pole near park is off",
            category="STREETLIGHT",
            status="PENDING",
            latitude=22.72,
            longitude=75.86,
            priority_score=7,
            reported_by=self.reporter,
        )

        self.client.force_authenticate(user=self.admin_1)
        response = self.client.patch(
            reverse("issues-detail", args=[issue.id]),
            {"assigned_to_id": self.worker.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        worker_notifications = Notification.objects.filter(user=self.worker)
        self.assertEqual(worker_notifications.count(), 1)
        self.assertIn("assigned issue", worker_notifications.first().message)
        self.assertEqual(mock_realtime.call_count, 1)

    @patch("issues.views.send_realtime_notification")
    def test_worker_mark_completed_notifies_all_admins(self, mock_realtime):
        issue = Issue.objects.create(
            title="Garbage overflow",
            description="Bins are overflowing",
            category="GARBAGE",
            status="IN_PROGRESS",
            latitude=22.72,
            longitude=75.86,
            priority_score=7,
            reported_by=self.reporter,
            assigned_to=self.worker,
        )

        self.client.force_authenticate(user=self.worker)
        response = self.client.patch(
            reverse("issues-detail", args=[issue.id]),
            {"status": "COMPLETED"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        issue.refresh_from_db()
        self.assertEqual(issue.status, "COMPLETED")

        admin_notifications = Notification.objects.filter(
            user__in=[self.admin_1, self.admin_2],
            message__icontains="COMPLETED",
        )
        self.assertEqual(admin_notifications.count(), 2)
        self.assertEqual(mock_realtime.call_count, 2)

    @patch("issues.views.send_realtime_notification")
    def test_admin_mark_resolved_notifies_original_reporter(self, mock_realtime):
        issue = Issue.objects.create(
            title="Water leakage",
            description="Pipe leaking continuously",
            category="WATER",
            status="COMPLETED",
            latitude=22.72,
            longitude=75.86,
            priority_score=1,
            reported_by=self.reporter,
            assigned_to=self.worker,
        )

        self.client.force_authenticate(user=self.admin_1)
        response = self.client.patch(
            reverse("issues-detail", args=[issue.id]),
            {"status": "RESOLVED"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        reporter_notifications = Notification.objects.filter(user=self.reporter)
        self.assertEqual(reporter_notifications.count(), 1)
        self.assertIn("resolved by admin", reporter_notifications.first().message)
        self.assertEqual(mock_realtime.call_count, 1)
