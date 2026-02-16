from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError


# ======================================================
# USER MODEL
# ======================================================

class User(AbstractUser):

    ROLE_CHOICES = (
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
        ('WORKER', 'Worker'),
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='USER',
        db_index=True
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# ======================================================
# ISSUE MODEL
# ======================================================

class Issue(models.Model):

    CATEGORY_CHOICES = (
        ('POTHOLE', 'Pothole'),
        ('GARBAGE', 'Garbage'),
        ('STREETLIGHT', 'Street Light'),
        ('WATER', 'Water Leakage'),
        ('TRAFFIC', 'Traffic Signal'),
        ('OTHER', 'Other'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='issues/', null=True, blank=True)

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        db_index=True
    )

    latitude = models.FloatField()
    longitude = models.FloatField()

    priority_score = models.IntegerField(default=0, db_index=True)

    reported_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reported_issues',
        db_index=True
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues',
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['priority_score']),
        ]

    def clean(self):
        # Prevent assigning non-worker users
        if self.assigned_to and self.assigned_to.role != "WORKER":
            raise ValidationError("Assigned user must have WORKER role.")

    def __str__(self):
        return f"{self.title} - {self.status}"


# ======================================================
# NOTIFICATION MODEL
# ======================================================

class Notification(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True
    )

    message = models.TextField()

    is_read = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.message[:20]}"
