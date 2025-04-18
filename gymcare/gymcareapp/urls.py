from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import TrainingPackageViewSet, \
    TrainerPackageViewSet, \
    UserViewSet, \
    MemberSubscriptionViewSet, \
    CategoryPackageViewSet, \
    SubscriptionViewSet, \
    MemberViewSet, \
    TrainerViewSet, \
    WorkoutScheduleViewSet
router = DefaultRouter()
router.register('user', views.UserViewSet, basename='user')
router.register('trainer', views.TrainerViewSet, basename='trainer')
router.register('member', views.MemberViewSet, basename='member')
router.register('category-package', views.CategoryPackageViewSet, basename='category-package')
router.register('training-package', views.TrainingPackageViewSet, basename='training-package')
router.register('trainer-packages', views.TrainerPackageViewSet, basename='trainer-packages')
router.register('member-subscriptions', views.MemberSubscriptionViewSet, basename='member-Subscriptions')
router.register('subscriptions', views.SubscriptionViewSet, basename='subscription')
router.register('workout-schedules', WorkoutScheduleViewSet, basename='workout-schedule')




urlpatterns = [
    path('', include(router.urls)),

]