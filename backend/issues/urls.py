from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import IssueViewSet, DashboardStatsView,NearbyIssuesView,UserViewSet,NotificationViewSet


router = DefaultRouter()
router.register(r'issues', IssueViewSet, basename='issue')
router.register(r'users', UserViewSet, basename='user')
router.register(r'notifications', NotificationViewSet, basename='notifications')


urlpatterns = router.urls

urlpatterns += [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('nearby/', NearbyIssuesView.as_view(), name='nearby-issues'),
]
