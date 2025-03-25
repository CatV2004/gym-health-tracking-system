from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('user', views.UserViewSet, basename='user')
router.register('trainer', views.TrainerViewSet, basename='trainer')
router.register('member', views.MemberViewSet, basename='member')


urlpatterns = [
    path('', include(router.urls)),
]