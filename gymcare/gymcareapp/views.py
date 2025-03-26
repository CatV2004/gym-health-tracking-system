from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_401_UNAUTHORIZED

from .paginators import Pagination
from django.utils import timezone



from . import serializers
from .models import User, Member, Trainer, WorkoutSchedule, WorkoutScheduleStatus, Role, Subscription, TrainingPackage, \
    WorkoutScheduleChangeRequest, ChangeRequestStatus
from .pems import OwnerPermission, AdminPermission, TrainerPermission, MemberPermission
from .serializers import UserSerializer, ChangePasswordSerializer, MemberSerializer, TrainerSerializer, \
    TrainingPackageSerializer, TrainingPackageDetailSerializer, WorkoutScheduleCreateSerializer, \
    MemberSubscriptionSerializer, WorkoutScheduleSerializer, WorkoutScheduleChangeRequestSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    def get_permissions(self):
        if self.action in ['get_all_users']:
            return [AdminPermission()]
        elif self.action in ['get_current_user','change_password']:
            return [IsAuthenticated()]
        else:
            return []

    class CustomPagination(PageNumberPagination):
        page_size = 10

    @action(methods=['get'], url_path='all-users', detail=False)
    def get_all_users(self, request):
        self.check_permissions(request)
        queryset = User.objects.filter(is_active=True)

        paginator = self.CustomPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)

        user_serializer = UserSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(user_serializer.data)

    @action(methods=['get'], url_path='current', detail=False)
    def get_current_user(self, request):
        user = request.user
        self.check_object_permissions(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path='change-password', detail=False)
    def change_password(self, request):
        user = request.user
        self.check_object_permissions(request, user)

        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save(update_fields=['password'])

            return Response({"message": "Mật khẩu đã được thay đổi thành công."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainerViewSet(viewsets.ViewSet):
    queryset = Trainer.objects.select_related('user')
    serializer_class = TrainerSerializer
    parser_classes = [JSONParser, MultiPartParser]

    def get_permissions(self):
        if self.action in ['available']:
            return []

    @action(detail=False, methods=['get'])
    def available(self, request):
        available_trainers = Trainer.objects.filter(schedule__isnull=True)
        serializer = self.get_serializer(available_trainers, many=True)
        return Response(serializer.data)

class MemberViewSet(viewsets.ViewSet):
    queryset = Member.objects.select_related('user')
    serializer_class = MemberSerializer
    parser_classes = [JSONParser, MultiPartParser]

    def get_permissions(self):
        if self.action in ['pending_progress']:
            return [TrainerPermission]

    @action(detail=False, url_path='pending-progress', methods=['get'])
    def pending_progress(self, request):
        members = Member.objects.filter(progress__isnull=True)
        serializer = self.get_serializer(members, many=True)
        return Response(serializer.data)


class TrainingPackageViewSet(viewsets.GenericViewSet, generics.RetrieveAPIView, generics.ListAPIView):
    queryset = TrainingPackage.objects.all()
    serializer_class = TrainingPackageDetailSerializer
    pagination_class = Pagination
    parser_classes = [JSONParser, MultiPartParser]

    def get_permissions(self):
        if self.action in ['subscribe']:
            return [MemberPermission()]
        return [permissions.AllowAny()]

    def get_member(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return None, Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        if not hasattr(user, 'member_profile'):
            return None, Response({"error": "Bạn không phải là hội viên."}, status=status.HTTP_403_FORBIDDEN)
        return user.member_profile, None

    @action(methods=['post'], detail=True, url_path='subscribe')
    def subscribe(self, request, pk=None):
        member, error_response = self.get_member(request)
        if error_response:
            return error_response

        training_package = TrainingPackage.objects.filter(id=pk).first()
        if not training_package:
            return Response({"error": "Gói tập không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        subscription = Subscription.objects.filter(member=member, training_package=training_package, active=True).first()
        if subscription:
            return Response({"message": "Bạn đã đăng ký gói tập này rồi."}, status=status.HTTP_400_BAD_REQUEST)

        subscription, created = Subscription.objects.update_or_create(
            member=member,
            training_package=training_package,
            defaults={"active": True}
        )

        return Response(
            TrainingPackageSerializer(training_package, context={"request": request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class TrainerPackageViewSet(viewsets.ViewSet):
    queryset = TrainingPackage.objects.all()
    serializer_class = TrainingPackageSerializer
    pagination_class = Pagination
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ['trainer_packages', 'package_detail']:
            return [TrainerPermission()]
        return []

    @action(detail=False, methods=["get"], url_path="my-packages")
    def trainer_packages(self, request):
        user = request.user
        if not hasattr(user, 'trainer_profile'):
            return Response({"error": "Bạn không phải là PT."}, status=status.HTTP_403_FORBIDDEN)

        packages = TrainingPackage.objects.filter(pt=user.trainer_profile)#.prefetch_related("subscriptions__member")
        serializer = TrainingPackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="package")
    def package_detail(self, request, id=None):
        user = request.user
        if not hasattr(user, 'trainer_profile'):
            return Response({"error": "Bạn không phải là PT."}, status=status.HTTP_403_FORBIDDEN)

        package = get_object_or_404(TrainingPackage, id=id, pt=user.trainer_profile)
        serializer = TrainingPackageSerializer(package)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MemberSubscriptionViewSet(viewsets.ViewSet):
    pagination_class = Pagination

    def get_permissions(self):
        if self.action in ['my_subscriptions', 'subscription_detail', 'schedule_workout']:
            return [MemberPermission()]
        return super().get_permissions()

    @action(detail=False, methods=["get"], url_path="my-packages")
    def my_subscriptions(self, request):
        user = request.user
        subscriptions = Subscription.objects.filter(member=user.member_profile, active=True)
        serializer = MemberSubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="package")
    def subscription_detail(self, request, pk=None):
        user = request.user
        try:
            subscription = Subscription.objects.get(id=pk, member=user.member_profile, active=True)
        except Subscription.DoesNotExist:
            return Response({"error": "Không tìm thấy gói tập hoặc không thuộc về bạn."},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = MemberSubscriptionSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="schedule")
    def schedule_workout(self, request, pk=None):
        user = request.user
        try:
            subscription = Subscription.objects.get(id=pk, member=user.member_profile, active=True)
        except Subscription.DoesNotExist:
            return Response({"error": "Gói tập không hợp lệ hoặc không thuộc về bạn."},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = WorkoutScheduleCreateSerializer(data=request.data)
        if serializer.is_valid():
            scheduled_at = serializer.validated_data['scheduled_at']
            duration = serializer.validated_data['duration']
            end_time = scheduled_at + timezone.timedelta(minutes=duration)

            overlapping_schedule = WorkoutSchedule.objects.filter(
                subscription__member=user.member_profile,
                scheduled_at__lt=end_time,
            ).exclude(scheduled_at__gte=scheduled_at + timezone.timedelta(
                minutes=duration))

            if overlapping_schedule.exists():
                return Response({"error": "Bạn đã có một buổi tập trùng thời gian này."},
                                status=status.HTTP_400_BAD_REQUEST)

            serializer.save(subscription=subscription, status=0)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainerWorkoutScheduleViewSet(viewsets.ViewSet):
    pagination_class = Pagination
    def get_permissions(self):
        if self.action in ['workout_schedules']:
            return [TrainerPermission()]

    @action(detail=True, methods=["get"], url_path="workout-schedules")
    def workout_schedules(self, request, pk=None):
        user = request.user

        if not hasattr(user, 'trainer_profile'):
            return Response({"error": "Bạn không phải là PT."}, status=status.HTTP_403_FORBIDDEN)

        training_package = get_object_or_404(TrainingPackage, pk=pk, pt=user.trainer_profile)

        workout_schedules = WorkoutSchedule.objects.filter(subscription__training_package=training_package)

        serializer = WorkoutScheduleSerializer(workout_schedules, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TrainerScheduleApprovalViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ['approve_or_reject_schedule']:
            return [TrainerPermission()]

    @action(detail=True, methods=["patch"], url_path="approve-or-reject")
    def approve_or_reject_schedule(self, request, pk=None):
        user = request.user

        if not hasattr(user, 'trainer_profile'):
            return Response({"error": "Bạn không phải là PT."}, status=status.HTTP_403_FORBIDDEN)

        schedule = get_object_or_404(WorkoutSchedule, pk=pk, subscription__training_package__pt=user.trainer_profile)

        new_status = request.data.get("status")
        if new_status not in [WorkoutScheduleStatus.COMPLETED.value, WorkoutScheduleStatus.CANCELLED.value]:
            return Response({"error": "Trạng thái không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)

        schedule.status = new_status
        schedule.save()

        return Response({"message": "Cập nhật trạng thái thành công!"}, status=status.HTTP_200_OK)


class TrainerScheduleChangeRequestViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ['request_schedule_change']:
            return [TrainerPermission()]

    @action(detail=True, methods=["post"], url_path="request-change")
    def request_schedule_change(self, request, pk=None):
        user = request.user

        if not hasattr(user, 'trainer_profile'):
            return Response({"error": "Bạn không phải là PT."}, status=status.HTTP_403_FORBIDDEN)

        schedule = get_object_or_404(WorkoutSchedule, pk=pk, subscription__training_package__pt=user.trainer_profile)

        proposed_time = request.data.get("proposed_time")
        reason = request.data.get("reason", "")

        if not proposed_time:
            return Response({"error": "Vui lòng cung cấp thời gian đề xuất."}, status=status.HTTP_400_BAD_REQUEST)

        change_request = WorkoutScheduleChangeRequest.objects.create(
            schedule=schedule,
            trainer=user.trainer_profile,
            proposed_time=proposed_time,
            reason=reason,
            status=ChangeRequestStatus.PENDING.value
        )

        schedule.status = WorkoutScheduleStatus.PENDING_CHANGE.value
        schedule.save()

        return Response(WorkoutScheduleChangeRequestSerializer(change_request).data, status=status.HTTP_201_CREATED)