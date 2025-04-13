from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import TrainingPackageViewSet, TrainerPackageViewSet, MemberSubscriptionViewSet, \
    TrainerWorkoutScheduleViewSet, TrainerScheduleApprovalViewSet, TrainerScheduleChangeRequestViewSet

router = DefaultRouter()
router.register('user', views.UserViewSet, basename='user')
router.register('trainer', views.TrainerViewSet, basename='trainer')
router.register('member', views.MemberViewSet, basename='member')
router.register('trainer-workout-schedule', TrainerWorkoutScheduleViewSet, basename='trainer-workout-schedule')
router.register('training-package', TrainingPackageViewSet, basename='training-package')
router.register('trainer-packages', TrainerPackageViewSet, basename='trainer-packages')
router.register('member-subscriptions', MemberSubscriptionViewSet, basename='member-Subscriptions')
router.register(r'trainer-schedules', TrainerScheduleApprovalViewSet, basename='trainer-schedules')
router.register(r'trainer-schedule-changes', TrainerScheduleChangeRequestViewSet, basename='trainer-schedule-changes')

urlpatterns = [
    path('', include(router.urls)),

]