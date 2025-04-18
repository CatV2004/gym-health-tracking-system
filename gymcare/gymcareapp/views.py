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
from django.db.models import Count

from .paginators import Pagination
from django.utils import timezone

from . import serializers
from .models import *
from .pems import *
from .serializers import UserSerializer, CategoryPackageSerializer, TrainingPackageSerializer, \
    UpdateUserSerializer, TrainerSerializer, TrainerRegisterSerializer, MemberSerializer, \
    ChangePasswordSerializer, MemberRegisterSerializer, TrainingPackageDetailSerializer, \
    SubscriptionSerializer, SubscriptionCreateSerializer, WorkoutScheduleCreateSerializer, \
    WorkoutScheduleTrainerSerializer


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

    @action(detail=False, methods=['get'], url_path='workout-schedules')
    def workout_schedules(self, request):
        trainer = getattr(request.user, 'trainer_profile', None)
        if not trainer:
            return Response({"detail": "Tài khoản không phải trainer."}, status=status.HTTP_403_FORBIDDEN)

        schedules = WorkoutSchedule.objects.filter(
            subscription__training_package__trainer=trainer
        ).select_related(
            'subscription__member__user',
            'subscription__training_package'
        ).order_by('-scheduled_at')

        page = self.paginate_queryset(schedules)
        serializer = WorkoutScheduleTrainerSerializer(page if page is not None else schedules, many=True)

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response({
            "message": "Danh sách lịch tập của hội viên trong gói bạn phụ trách.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

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


class CategoryPackageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CategoryPackage.objects.all()

    serializer_class = CategoryPackageSerializer
    class CustomPagination(PageNumberPagination):
        page_size = 5
        page_size_query_param = 'page_size'
        max_page_size = 100

    pagination_class = CustomPagination

    def get_permissions(self):
        return [permissions.AllowAny()]

    @action(detail=True, methods=['get'])
    def packages(self, request, pk=None):
        category = self.get_object()
        packages = category.packages.all()

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(packages, request, view=self)
        if page is not None:
            serializer = TrainingPackageSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = TrainingPackageSerializer(packages, many=True, context={'request': request})
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

    def get_serializer_class(self):
        if self.action == 'subscribe':
            return SubscriptionSerializer
        return super().get_serializer_class()

    def get_member(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return None, Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        if not hasattr(user, 'member_profile'):
            return None, Response({"error": "Bạn không phải là hội viên."}, status=status.HTTP_403_FORBIDDEN)
        return user.member_profile, None


class TrainerPackageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TrainingPackageSerializer
    permission_classes = [TrainerPermission]

    def get_queryset(self):
        return TrainingPackage.objects.filter(
            pt__user=self.request.user,
            active=True
        ).annotate(member_count=Count('subscriptions')).select_related('pt__user')


class MemberSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [MemberPermission]

    def get_queryset(self):
        return Subscription.objects.filter(
            member__user=self.request.user,
            active=True
        ).select_related('training_package', 'training_package__pt')


class SubscriptionViewSet(viewsets.GenericViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionCreateSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [MemberPermission()]
        return []

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'member_profile'):
            return Subscription.objects.none()

        return self.queryset.filter(member=user.member_profile, active=True)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription = serializer.save()
        return Response({
            "message": "Đăng ký gói tập thành công.",
                "data": SubscriptionCreateSerializer(subscription).data
        }, status=status.HTTP_201_CREATED)


class WorkoutScheduleViewSet(viewsets.GenericViewSet,
                             viewsets.mixins.CreateModelMixin,
                             viewsets.mixins.ListModelMixin):
    queryset = WorkoutSchedule.objects.all()
    serializer_class = WorkoutScheduleCreateSerializer
    permission_classes = [MemberPermission]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'member_profile'):
            return WorkoutSchedule.objects.none()
        return self.queryset.filter(subscription__member=user.member_profile)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        workout_schedule = serializer.save()
        return Response({
            "message": "Lên lịch tập thành công.",
            "data": WorkoutScheduleCreateSerializer(workout_schedule).data
        }, status=status.HTTP_201_CREATED)



