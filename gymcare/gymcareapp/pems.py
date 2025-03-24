from rest_framework import permissions

from gymcare.gymcareapp.models import Subscription, Role


class OwnerPermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, object):
        return super().has_permission(request, view) and request.user == object.user


class AdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 0


class MemberPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 2


class TrainerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 1


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

        if request.method == 'PO    ST':
            return is_subscribed

        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return obj.reviewer == member or request.user.role == Role.ADMIN.value

        return True


class ChatPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [0, 1, 2]
