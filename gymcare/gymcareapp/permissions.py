from rest_framework import permissions
from django.core.exceptions import ObjectDoesNotExist
from .models import Role, Member, Trainer, Subscription, WorkoutSchedule, WorkoutScheduleChangeRequest, \
    SubscriptionStatus


class IsAdmin(permissions.BasePermission):
    """
    Cho phép chỉ Admin truy cập
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.ADMIN.value


class IsTrainer(permissions.BasePermission):
    """
    Cho phép chỉ Trainer truy cập
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.TRAINER.value


class IsMember(permissions.BasePermission):
    """
    Cho phép chỉ Member truy cập
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.MEMBER.value


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Cho phép chủ sở hữu hoặc admin truy cập
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMIN.value:
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user

        if hasattr(obj, 'member') and hasattr(obj.member, 'user'):
            return obj.member.user == request.user

        if hasattr(obj, 'trainer') and hasattr(obj.trainer, 'user'):
            return obj.trainer.user == request.user

        return False


class GetCurrentUserPermission(permissions.BasePermission):
    """
    Permission cho endpoint lấy thông tin user hiện tại
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated


class MemberSubscriptionPermission(permissions.BasePermission):
    """
    Permission cho các nghiệp vụ đăng ký gói tập của member
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.role != Role.MEMBER.value:
            return False

        try:
            member = request.user.member_profile
            return True
        except ObjectDoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMIN.value:
            return True

        if hasattr(obj, 'member') and hasattr(obj.member, 'user'):
            return obj.member.user == request.user

        return False


class MemberSchedulePermission(permissions.BasePermission):
    """
    Permission cho các nghiệp vụ lên lịch tập của member
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.role != Role.MEMBER.value:
            return False

        try:
            member = request.user.member_profile
            return True
        except ObjectDoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMIN.value:
            return True

        if isinstance(obj, WorkoutSchedule):
            return obj.subscription.member.user == request.user
        elif hasattr(obj, 'member') and hasattr(obj.member, 'user'):
            return obj.member.user == request.user

        return False


class TrainerScheduleChangePermission(permissions.BasePermission):
    """
    Permission cho yêu cầu thay đổi lịch tập của trainer
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.role != Role.TRAINER.value:
            return False

        try:
            trainer = request.user.trainer_profile
            return True
        except ObjectDoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMIN.value:
            return True

        if isinstance(obj, WorkoutScheduleChangeRequest):
            return obj.trainer.user == request.user
        elif isinstance(obj, WorkoutSchedule):
            return obj.subscription.training_package.pt.user == request.user

        return False


class PaymentPermission(permissions.BasePermission):
    """
    Permission cho các nghiệp vụ thanh toán
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role == Role.ADMIN.value:
            return True

        if request.user.role == Role.MEMBER.value:
            try:
                member = request.user.member_profile
                return True
            except ObjectDoesNotExist:
                return False

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMIN.value:
            return True

        if hasattr(obj, 'subscription') and hasattr(obj.subscription, 'member') and hasattr(obj.subscription.member,
                                                                                            'user'):
            return obj.subscription.member.user == request.user

        return False


class ReviewPermission(permissions.BasePermission):
    """
    Permission cho các nghiệp vụ đánh giá
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        # Chỉ member mới được tạo review
        if request.user.role != Role.MEMBER.value:
            return False

        try:
            member = request.user.member_profile
            return True
        except ObjectDoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.role == Role.ADMIN.value:
            return True

        return obj.reviewer.user == request.user


class WorkoutProgressPermission(permissions.BasePermission):
    """
    Permission cho các nghiệp vụ liên quan đến tiến độ tập luyện
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role == Role.ADMIN.value:
            return True

        if request.user.role == Role.TRAINER.value:
            try:
                trainer = request.user.trainer_profile
                return True
            except ObjectDoesNotExist:
                return False

        if request.user.role == Role.MEMBER.value:
            try:
                member = request.user.member_profile
                return True
            except ObjectDoesNotExist:
                return False

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMIN.value:
            return True

        if request.user.role == Role.MEMBER.value:
            return obj.member.user == request.user

        if request.user.role == Role.TRAINER.value:
            trainer = request.user.trainer_profile
            return obj.member.subscriptions.filter(
                training_package__pt=trainer,
                status=SubscriptionStatus.ACTIVE
            ).exists()

        return False