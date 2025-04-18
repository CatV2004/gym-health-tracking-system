from rest_framework import permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Subscription, Role, User, TrainingPackage


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsAdminOrSelfTrainer(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and (request.user.is_staff or request.user == obj.user)


class OwnerPermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and request.user == obj.user


class OwnerUserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return isinstance(obj, User) and request.user == obj


class AdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 0


class MemberPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'member_profile')

    def has_object_permission(self, request, view, obj):
        member = getattr(request.user, 'member_profile', None)
        if not member:
            return False

        if isinstance(obj, Subscription):
            return obj.member == member

        if isinstance(obj, WorkoutSchedule):
            return obj.subscription.member == member

        if hasattr(obj, 'schedule') and hasattr(obj.schedule, 'subscription'):
            return obj.schedule.subscription.member == member

        return False


class TrainerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'trainer_profile')

    def has_object_permission(self, request, view, obj):
        trainer = getattr(request.user, 'trainer_profile', None)

        if not trainer:
            return False

        if isinstance(obj, Subscription):
            return obj.training_package.pt == trainer

        if isinstance(obj, TrainingPackage):
            return obj.pt == trainer

        return False


class ReviewPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'member_profile')

    def has_object_permission(self, request, view, obj):

        if not hasattr(request.user, 'member_profile'):
            return False

        member = request.user.member_profile

        is_subscribed = Subscription.objects.filter(
            member=member,
            training_package=obj.training_package
        ).exists()

        if request.method == 'POST':
            return is_subscribed

        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return obj.reviewer == member or request.user.role == Role.ADMIN.value

        return True


class ChatPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [0, 1, 2]
