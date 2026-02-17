from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    IssueViewSet,
    DashboardStatsView,
    NearbyIssuesView,
    UserViewSet,
    NotificationViewSet,
    UserRegistrationView
)

router = DefaultRouter()

# Main Resources
router.register(r'issues', IssueViewSet, basename='issues')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'users', UserViewSet, basename='users')


urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register-user'),

    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Map / Geo
    path('issues/nearby/', NearbyIssuesView.as_view(), name='nearby-issues'),
]
