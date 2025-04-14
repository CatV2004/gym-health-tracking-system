from rest_framework import viewsets, status, generics, permissions, mixins
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_401_UNAUTHORIZED
from rest_framework.viewsets import ModelViewSet

from .paginators import Pagination
from django.utils import timezone

from . import serializers
from .models import User, Member, Trainer, WorkoutSchedule, WorkoutScheduleStatus, Role, Subscription, TrainingPackage, \
    WorkoutScheduleChangeRequest, ChangeRequestStatus
from .pems import OwnerPermission, AdminPermission, TrainerPermission, MemberPermission, OwnerUserPermission, \
    IsAdminOrReadOnly, IsAdminOrSelfTrainer
from .serializers import UserSerializer, ChangePasswordSerializer, MemberSerializer, TrainerSerializer, \
    TrainingPackageSerializer, TrainingPackageDetailSerializer, WorkoutScheduleCreateSerializer, \
    MemberSubscriptionSerializer, WorkoutScheduleSerializer, WorkoutScheduleChangeRequestSerializer, \
    WorkoutScheduleChangeRequest, MemberRegisterSerializer, TrainerRegisterSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    def get_serializer_class(self):
        if self.action == 'change_password':
            return ChangePasswordSerializer
        elif self.action in ['update', 'partial_update']:
            return serializers.UpdateUserSerializer
        return serializers.UserSerializer

    def get_permissions(self):
        if self.request.method == 'GET' and self.action == 'get_all_users':
            return [AdminPermission()]
        elif self.request.method in ['PATCH', 'PUT']:
            return [OwnerUserPermission()]
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

    @action(methods=['patch'], url_path='update', detail=False)
    def update_info(self, request, *args, **kwargs):
        user = request.user
        self.check_object_permissions(request, user)

        serializer = serializers.UpdateUserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainerViewSet(mixins.CreateModelMixin,
                     mixins.ListModelMixin,
                     mixins.DestroyModelMixin,
                     viewsets.GenericViewSet):
    queryset = Trainer.objects.select_related("user").all()

    def get_serializer_class(self):
        if self.action == 'create':
            return TrainerRegisterSerializer
        return TrainerSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AdminPermission()]
        return [IsAuthenticated(), IsAdminOrSelfTrainer()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.user.active = False
        instance.user.save()
        return Response({"message": "Trainer deactivated successfully"}, status=status.HTTP_204_NO_CONTENT)


class MemberViewSet(mixins.CreateModelMixin,
                    mixins.DestroyModelMixin,
                    viewsets.GenericViewSet):
    queryset = Member.objects.select_related("user").all()

    def get_serializer_class(self):
        if self.action == 'create':
            return MemberRegisterSerializer
        return MemberSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        elif self.action in ['destroy', 'update_health_info']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.soft_delete()
        return Response({"message": "Member deactivated successfully"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["patch"], url_path="health")
    def update_health_info(self, request, pk=None):
        member = self.get_object()
        for field in ["height", "weight", "goal"]:
            if field in request.data:
                setattr(member, field, request.data[field])
        member.save()
        return Response({"message": "Health information updated successfully"}, status=status.HTTP_200_OK)






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
        return []

    @action(detail=True, methods=["patch"], url_path="approve-or-reject")
    def approve_or_reject_schedule(self, request, pk=None):
        user = request.user

        if not hasattr(user, 'trainer_profile'):
            return Response({"error": "Bạn không phải là PT."}, status=status.HTTP_403_FORBIDDEN)

        schedule = get_object_or_404(WorkoutSchedule, id=pk)

        self.check_object_permissions(request, schedule)

        new_status = request.data.get("status")
        if new_status not in [WorkoutScheduleStatus.COMPLETED.value, WorkoutScheduleStatus.CANCELLED.value]:
            return Response({"error": "Trạng thái không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)

        schedule.status = new_status
        schedule.save()

        return Response({"message": "Cập nhật trạng thái thành công!"}, status=status.HTTP_200_OK)



class TrainerScheduleChangeRequestViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ['approve_or_reject_schedule']:
            return [TrainerPermission()]
        elif self.action in ['approve_or_reject_change_request']:
            return [MemberPermission()]
        return []

    @action(detail=True, methods=["post"], url_path="request-change")
    def request_schedule_change(self, request, pk=None):
        user = request.user

        if not hasattr(user, 'trainer_profile'):
            return Response({"error": "Bạn không phải là PT."}, status=status.HTTP_403_FORBIDDEN)

        schedule = get_object_or_404(WorkoutSchedule, id=pk)

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

    @action(detail=True, methods=["patch"], url_path="approve-or-reject")
    def approve_or_reject_change_request(self, request, pk=None):
        user = request.user

        if not hasattr(user, 'member_profile'):
            return Response({"error": "Bạn không phải là hội viên."}, status=status.HTTP_403_FORBIDDEN)

        change_request = get_object_or_404(WorkoutScheduleChangeRequest, pk=pk)

        if change_request.schedule.subscription.member != user.member_profile:
            return Response({"error": "Bạn không có quyền duyệt yêu cầu này."}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get("status")
        if new_status not in [ChangeRequestStatus.ACCEPTED.value, ChangeRequestStatus.REJECTED.value]:
            return Response({"error": "Trạng thái không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)

        change_request.status = new_status
        change_request.save()

        if new_status == ChangeRequestStatus.ACCEPTED.value:
            change_request.schedule.scheduled_at = change_request.proposed_time
            change_request.schedule.status = WorkoutScheduleStatus.CHANGED.value
            change_request.schedule.save()
            return Response({"message": "Lịch tập đã được cập nhật."}, status=status.HTTP_200_OK)
        else:
            change_request.schedule.status = WorkoutScheduleStatus.SCHEDULED.value
            change_request.schedule.save()
            return Response({"message": "Yêu cầu thay đổi đã bị từ chối."}, status=status.HTTP_200_OK)


