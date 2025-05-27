from datetime import timedelta
from django.shortcuts import render
from rest_framework import viewsets, status, generics, permissions, mixins
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_401_UNAUTHORIZED
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from django.db.models import Count, Avg
from rest_framework.decorators import api_view
from .paginators import Pagination
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from . import serializers
from .models import *
from .pems import *
from .permissions import *
import json
import uuid
from .utils.vnpay_helper import VNPay, VNPayDatabase, get_client_ip
from .serializers import UserSerializer, CurrentUserSerializer,PaymentCreateSerializer,PaymentSerializer,SubscriptionSerializer,SubscriptionCreateSerializer,PaymentRequestSerializer,WorkoutProgressSerializer,PTDashboardSerializer,ReviewSerializer,WorkoutScheduleSerializer,MemberResponseToChangeRequestSerializer,ReviewDisplaySerializer,MemberSerializer,MemberHealthUpdateSerializer,VNPayCreateSerializer,PriorityMemberSerializer,PaymentResponseSerializer,WorkoutScheduleChangeRequestSerializer,PaymentForm,CategoryPackageSerializer,ChangePasswordSerializer,MemberRegisterSerializer,TrainingPackageDetailSerializer,TrainerSerializer,TrainerRegisterSerializer,UpdateUserSerializer,TrainingPackageSerializer
from django.db import transaction
from .utils.zalopay_helper import ZaloPayHelper
import requests
import hashlib
import hmac
import time
from django.conf import settings
from datetime import datetime, timedelta


class ZaloPayOrderView(APIView):
    def post(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk)

        payment = get_object_or_404(Payment, pk=pk)

        try:
            app_id = settings.ZALOPAY_CONFIG["app_id"]
            key1 = settings.ZALOPAY_CONFIG["key1"]
            create_order_url = "https://sandbox.zalopay.com.vn/v001/tpe/createorder"  # link sandbox

            amount = int(payment.amount)
            app_trans_id = f"{int(time.time())}"
            app_user = "gymcare-user"
            order = {
                "app_id": app_id,
                "app_trans_id": app_trans_id,
                "app_user": app_user,
                "amount": amount,
                "description": f"Thanh toán đơn hàng #{payment.id} tại GymCare",
                "bank_code": "zalopayapp",
                "item": "[]",
                "embed_data": "{}",
                "callback_url": "https://yourdomain.com/payment/callback/",
            }

            data = f"{order['app_id']}|{order['app_trans_id']}|{order['app_user']}|{order['amount']}|{order['app_user']}|{order['description']}|{order['bank_code']}|{order['item']}|{order['embed_data']}|{order['callback_url']}"
            mac = hmac.new(key1.encode(), data.encode(), hashlib.sha256).hexdigest()
            order['mac'] = mac

            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            response = requests.post(create_order_url, data=order, headers=headers)

            res_data = response.json()

            if res_data.get("return_code") == 1:
                order_url = res_data.get("order_url")
                return Response({"order_url": order_url}, status=status.HTTP_200_OK)
            else:
                return Response({"error": res_data.get("return_message")}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'change_password':
            return ChangePasswordSerializer
        elif self.action in ['update', 'partial_update', 'update_info']:
            return serializers.UpdateUserSerializer
        elif self.action == 'get_current_user':
            return serializers.CurrentUserSerializer
        return serializers.UserSerializer

    # def get_permissions(self):
    #     if self.request.method == 'GET' and self.action == 'get_all_users' and self.action == 'get_user_by_id':
    #         return [IsAuthenticated ()]
    #     elif self.request.method in ['PATCH', 'PUT'] or self.action == 'get_current_user':
    #         return [OwnerUserPermission()]
    #     else:
    #         return []

    def get_permissions(self):
        if self.action in ['get_current_user', 'change_password', 'update_info']:
            return [GetCurrentUserPermission()]
        elif self.action in ['get_all_users', 'get_user_by_id']:
            return [permissions.AllowAny()]
        elif self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.AllowAny()]

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

    @action(methods=['get'], url_path='get-user', detail=False)
    def get_user_by_id(self, request):
        user_id = request.query_params.get('id')
        if not user_id:
            return Response({'error': 'Thiếu tham số id.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return Response({'error': 'Không tìm thấy người dùng.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = serializers.UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='current', detail=False)
    def get_current_user(self, request):
        user = request.user
        self.check_object_permissions(request, user)
        serializer = self.get_serializer(user)
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

        data = request.data.copy()
        if 'avatar' in request.FILES:
            data['avatar'] = request.FILES['avatar']

        serializer = serializers.UpdateUserSerializer(user, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainerViewSet(mixins.CreateModelMixin,
                     mixins.ListModelMixin,
                     mixins.DestroyModelMixin,
                    mixins.RetrieveModelMixin,
                     viewsets.GenericViewSet):
    queryset = Trainer.objects.select_related("user").all()

    def get_serializer_class(self):
        if self.action == 'create':
            return TrainerRegisterSerializer
        elif self.action == 'respond_change_request':
            return WorkoutScheduleChangeRequestSerializer
        elif self.action in ['my_members','my_member_detail']:
            return MemberSerializer
        elif self.action in ['record_progress']:
            return WorkoutProgressSerializer
        return TrainerSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdmin()]
        elif self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action == 'destroy':
            return [IsAdmin()]
        elif self.action in ['workout_schedules', 'my_members', 'my_member_detail',
                             'record_progress', 'get_progress_history', 'today_schedules']:
            return [IsTrainer()]
        return [IsAdmin()]

    # def get_permissions(self):
    #     if self.action == ['create','destroy','workout_schedules']:
    #         return [AdminPermission()]
    #     elif self.request.method in ['GET']:
    #         return [permissions.AllowAny()]
    #     return [IsAuthenticated(), IsAdminOrSelfTrainer()]

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
            subscription__training_package__pt=trainer,
            training_type = TrainingType.PERSONAL_TRAINER.value
        ).select_related(
            'subscription__member__user',
            'subscription__training_package'
        ).order_by('-scheduled_at')

        page = self.paginate_queryset(schedules)
        serializer = WorkoutScheduleSerializer(page if page is not None else schedules, many=True)

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response({
            "message": "Danh sách lịch tập của hội viên trong gói bạn phụ trách.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='today-schedules')
    def today_schedules(self, request):
        trainer = getattr(request.user, 'trainer_profile', None)
        if not trainer:
            return Response({"detail": "Tài khoản không phải trainer."}, status=status.HTTP_403_FORBIDDEN)

        today = now().date()
        start_of_day = today
        end_of_day = today + timedelta(days=1)

        schedules = WorkoutSchedule.objects.filter(
            subscription__training_package__pt=trainer,
            training_type=TrainingType.PERSONAL_TRAINER.value,
            scheduled_at__date=today
        ).select_related(
            'subscription__member__user',
            'subscription__training_package'
        ).order_by('scheduled_at')

        page = self.paginate_queryset(schedules)
        serializer = WorkoutScheduleSerializer(page if page is not None else schedules, many=True)

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response({
            "message": "Danh sách lịch tập hôm nay của bạn.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-members')
    def my_members(self, request):
        trainer = getattr(request.user, 'trainer_profile', None)
        if not trainer:
            return Response({"detail": "Tài khoản không phải trainer."}, status=status.HTTP_403_FORBIDDEN)

        subscriptions = Subscription.objects.filter(
            training_package__pt=trainer
        ).select_related('member__user')

        members = Member.objects.filter(id__in=subscriptions.values_list('member_id', flat=True).distinct())

        page = self.paginate_queryset(members)
        serializer = MemberSerializer(page if page is not None else members, many=True)

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response({
            "message": "Danh sách học viên bạn đang phụ trách.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-members/(?P<member_id>[^/.]+)')
    def my_member_detail(self, request, member_id):
        trainer = getattr(request.user, 'trainer_profile', None)
        if not trainer:
            return Response({"detail": "Tài khoản không phải trainer."}, status=status.HTTP_403_FORBIDDEN)

        is_member_under_trainer = Subscription.objects.filter(
            training_package__pt=trainer,
            member__id=member_id
        ).exists()

        if not is_member_under_trainer:
            return Response({"detail": "Bạn không có quyền xem học viên này."}, status=status.HTTP_403_FORBIDDEN)

        try:
            member = Member.objects.select_related('user').get(id=member_id)
        except Member.DoesNotExist:
            return Response({"detail": "Không tìm thấy học viên."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MemberSerializer(member)
        return Response({
            "message": "Thông tin chi tiết học viên.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='my-members/(?P<member_id>[^/.]+)/progress')
    def record_progress(self, request, member_id):
        trainer = getattr(request.user, 'trainer_profile', None)
        if not trainer:
            return Response({"detail": "Tài khoản không phải trainer."}, status=status.HTTP_403_FORBIDDEN)

        is_member_under_trainer = Subscription.objects.filter(
            training_package__pt=trainer,
            member__id=member_id
        ).exists()

        if not is_member_under_trainer:
            return Response({"detail": "Bạn không có quyền cập nhật học viên này."}, status=status.HTTP_403_FORBIDDEN)

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response({"detail": "Không tìm thấy học viên."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorkoutProgressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(member=member, recorded_by=trainer)
            return Response({
                "message": "Tiến độ luyện tập đã được cập nhật.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='my-members/(?P<member_id>[^/.]+)/get-progress')
    def get_progress_history(self, request, member_id):
        trainer = getattr(request.user, 'trainer_profile', None)
        if not trainer:
            return Response({"detail": "Tài khoản không phải trainer."}, status=status.HTTP_403_FORBIDDEN)

        is_member_under_trainer = Subscription.objects.filter(
            training_package__pt=trainer,
            member__id=member_id
        ).exists()

        if not is_member_under_trainer:
            return Response({"detail": "Bạn không có quyền xem học viên này."}, status=status.HTTP_403_FORBIDDEN)

        progress_history = WorkoutProgress.objects.filter(
            member__id=member_id,
            recorded_by=trainer
        ).order_by('-created_date')

        page = self.paginate_queryset(progress_history)
        serializer = WorkoutProgressSerializer(page if page is not None else progress_history, many=True)

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response({
            "message": "Lịch sử tiến độ học viên.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class MemberViewSet(mixins.CreateModelMixin,
                    mixins.DestroyModelMixin,
                    viewsets.GenericViewSet):
    queryset = Member.objects.select_related("user").all()

    def get_serializer_class(self):
        if self.action == 'create':
            return MemberRegisterSerializer
        elif self.action == 'get_member_workout_schedules':
            return WorkoutScheduleSerializer
        elif self.action in ['update_health_info', 'get_health_info']:
            return MemberHealthUpdateSerializer
        return MemberSerializer

    # def get_permissions(self):
    #     if self.action == 'create':
    #         return [permissions.AllowAny()]
    #     elif self.action in ['destroy', 'update_health_info']:
    #         return [permissions.IsAuthenticated()]
    #     return [permissions.AllowAny()]

    def get_permissions(self):
        if self.action in ['create', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['destroy']:
            return [IsAdmin()]
        elif self.action in ['workout_schedules', 'my_members', 'my_member_detail',
                             'record_progress', 'get_progress_history']:
            return [IsTrainer()]

        return [permissions.IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.soft_delete()
        return Response({"message": "Member deactivated successfully"}, status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=["patch"], url_path="health")
    def update_health_info(self, request):
        try:
            member = request.user.member_profile
        except Member.DoesNotExist:
            return Response({"error": "Bạn không phải là hội viên."},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(member, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "Cập nhật thông tin sức khỏe thành công.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="get-health")
    def get_health_info(self, request):
        try:
            member = request.user.member_profile
        except Member.DoesNotExist:
            return Response({"error": "Bạn không phải là hội viên."},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='workout-schedules')
    def get_member_workout_schedules(self, request):
        member = getattr(request.user, 'member_profile', None)
        if not member:
            return Response({"detail": "Tài khoản không phải hội viên."}, status=status.HTTP_403_FORBIDDEN)

        schedules = WorkoutSchedule.objects.filter(subscription__member=member).select_related(
            'subscription__training_package', 'subscription__member', 'subscription__training_package__pt'
        ).order_by('-scheduled_at')

        serializer = WorkoutScheduleSerializer(schedules, many=True)

        return Response({
            "message": "Danh sách lịch tập của hội viên.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='record-progress', permission_classes=[IsAuthenticated])
    def record_progress(self, request, pk=None):
        trainer = getattr(request.user, 'trainer_profile', None)
        if not trainer:
            return Response({"detail": "Tài khoản không phải trainer."}, status=status.HTTP_403_FORBIDDEN)
        try:
            member = Member.objects.get(id=pk)
        except Member.DoesNotExist:
            return Response({"detail": "Không tìm thấy hội viên."}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra xem member có thuộc gói tập của trainer này không
        is_member_under_trainer = Subscription.objects.filter(
            training_package__pt=trainer,
            member=member
        ).exists()

        if not is_member_under_trainer:
            return Response({"detail": "Bạn không có quyền cập nhật hội viên này."}, status=status.HTTP_403_FORBIDDEN)

        serializer = WorkoutProgressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(member=member, recorded_by=trainer)
            return Response({
                "message": "Tiến độ luyện tập đã được cập nhật.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    serializer_class = TrainingPackageSerializer
    pagination_class = Pagination
    parser_classes = [JSONParser, MultiPartParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.AllowAny()]

    # def get_serializer_class(self):
    #     if self.action == 'subscribe':
    #         return SubscriptionSerializer
    #     return super().get_serializer_class()

    def get_member(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return None, Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        if not hasattr(user, 'member_profile'):
            return None, Response({"error": "Bạn không phải là hội viên."}, status=status.HTTP_403_FORBIDDEN)
        return user.member_profile, None


# class TrainerPackageViewSet(viewsets.ReadOnlyModelViewSet):
#     serializer_class = TrainingPackageSerializer
#     permission_classes = [TrainerPermission]
#
#     def get_queryset(self):
#         return TrainingPackage.objects.filter(
#             pt__user=self.request.user,
#             active=True
#         ).annotate(member_count=Count('subscriptions')).select_related('pt__user')


class MemberSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsMember]

    def get_queryset(self):
        return Subscription.objects.filter(
            member__user=self.request.user,
            active=True,
            status=1
        ).select_related('training_package', 'training_package__pt')

    @action(detail=False, methods=['get'], url_path='expired')
    def expired_subscriptions(self, request):
        expired_subs = Subscription.objects.filter(
            member__user=request.user,
            active=False,
            status=2
        ).select_related('training_package', 'training_package__pt')
        serializer = self.get_serializer(expired_subs, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.GenericViewSet):
    queryset = Subscription.objects.all()

    def get_serializer_class(self):
        if self.action in ['create']:
            return SubscriptionCreateSerializer
        if self.action == 'retrieve':
            return SubscriptionSerializer
        else:
            return SubscriptionSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [MemberSubscriptionPermission()]
        else:
            return []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription = serializer.save()
        return Response({
            "message": "Đăng ký gói tập thành công.",
            "data": SubscriptionSerializer(subscription).data
        }, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            subscription = Subscription.objects.get(pk=pk)
        except Subscription.DoesNotExist:
            return Response({"detail": "Không tìm thấy gói tập."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)


# class WorkoutScheduleViewSet(viewsets.ViewSet):
#     permission_classes = [IsAuthenticated]
#
#     def get_queryset(self):
#         user = self.request.user
#         queryset = WorkoutSchedule.objects.all()
#         if hasattr(user, 'member_profile'):
#             queryset = queryset.filter(subscription__member=user.member_profile)
#         # elif hasattr(user, 'trainer_profile'):
#         #     queryset = queryset.filter(subscription__training_package__pt=user.trainer_profile)
#
#         return  queryset
#
#     def list(self, request):
#         queryset = self.get_queryset().order_by('-scheduled_at')
#         serializer = WorkoutScheduleSerializer(queryset, many=True)
#         return Response(serializer.data)
#
#     def retrieve(self, request, pk=None):
#         instance = get_object_or_404(self.get_queryset(), pk=pk)
#         serializer = WorkoutScheduleSerializer(instance)
#         return Response(serializer.data)
#
#     def create(self, request):
#         serializer = WorkoutScheduleSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         instance = serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#
#     def update(self, request, pk=None):
#         instance = get_object_or_404(WorkoutSchedule, pk=pk)
#         serializer = WorkoutScheduleSerializer(instance, data=request.data, partial=False)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data)
#
#     def partial_update(self, request, pk=None):
#         instance = get_object_or_404(WorkoutSchedule, pk=pk)
#         if hasattr(request.user, 'trainer_profile'):
#             if set(request.data.keys()) != {'status'} or request.data['status'] != WorkoutSchedule.COMPLETED:
#                 return Response(
#                     {"detail": "Trainer chỉ được phép cập nhật trạng thái thành COMPLETED"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#
#         serializer = WorkoutScheduleSerializer(instance, data=request.data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data)
#
#     @action(detail=True, methods=['get'], url_path='change-requests')
#     def change_requests(self, request, pk=None):
#         schedule = get_object_or_404(self.get_queryset(), pk=pk)
#
#         requests = WorkoutScheduleChangeRequest.objects.filter(
#             schedule=schedule
#         ).order_by('-created_date')
#
#         serializer = WorkoutScheduleChangeRequestSerializer(requests, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
#
#     # @action(detail=True, methods=['patch'], url_path='trainer-complete')
#     # def trainer_complete_session(self, request, pk=None):
#     #     instance = get_object_or_404(self.get_queryset(), pk=pk)
#     #
#     #     serializer = WorkoutScheduleSerializer(
#     #         instance,
#     #         data={'status': WorkoutScheduleStatus.COMPLETED.value},
#     #         partial=True
#     #     )
#     #     serializer.is_valid(raise_exception=True)
#     #     serializer.save()
#     #     return Response(serializer.data)

class WorkoutScheduleViewSet(viewsets.ModelViewSet):
    queryset = WorkoutSchedule.objects.all()
    serializer_class = WorkoutScheduleSerializer
    # permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create']:
            return [MemberSchedulePermission()]
        elif self.action in ['partial_update', 'trainer_approve_session']:
            return [TrainerScheduleChangePermission()]
        elif self.action == 'change_requests':
            return [MemberSchedulePermission()]
        else:
            return [IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if hasattr(user, 'member_profile'):
            queryset = queryset.filter(
                subscription__member=user.member_profile,
                subscription__active=True,
                subscription__status=1
            )
        return queryset.order_by('-scheduled_at')

    def partial_update(self, request, pk=None):
        instance = self.get_object()

        if hasattr(request.user, 'trainer_profile'):
            if set(request.data.keys()) != {'status'} or request.data[
                'status'] != WorkoutScheduleStatus.COMPLETED.value:
                return Response(
                    {"detail": "Trainer chỉ được phép cập nhật trạng thái thành COMPLETED"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='change-requests')
    def change_requests(self, request, pk=None):
        schedule = self.get_object()

        requests = WorkoutScheduleChangeRequest.objects.filter(
            schedule=schedule
        ).order_by('-created_date')

        serializer = WorkoutScheduleChangeRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='trainer-approve')
    def trainer_approve_session(self, request, pk=None):
        instance = get_object_or_404(self.get_queryset(), pk=pk)

        if instance.status not in [WorkoutScheduleStatus.SCHEDULED.value]:
            return Response(
                {"detail": "Chỉ có thể duyệt lịch có trạng thái SCHEDULED"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = WorkoutScheduleSerializer(
            instance,
            data={'status': WorkoutScheduleStatus.APPROVED.value},
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # @action(detail=True, methods=['patch'], url_path='trainer-complete')
    # def trainer_complete_session(self, request, pk=None):
    #     instance = get_object_or_404(self.get_queryset(), pk=pk)
    #
    #     serializer = WorkoutScheduleSerializer(
    #         instance,
    #         data={'status': WorkoutScheduleStatus.COMPLETED.value},
    #         partial=True
    #     )
    #     serializer.is_valid(raise_exception=True)
    #     serializer.save()
    #     return Response(serializer.data)


class WorkoutScheduleChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = WorkoutScheduleChangeRequest.objects.all()
    serializer_class = WorkoutScheduleChangeRequestSerializer
    # permission_classes = [IsTrainer, IsOwnerOrAdmin]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [MemberSchedulePermission()]
        elif self.action in ['create', 'destroy', 'cancel']:
            return [TrainerScheduleChangePermission()]
        elif self.action == 'member_response':
            return [MemberSchedulePermission()]
        elif self.action == 'member_requests':
            return [MemberSchedulePermission()]
        else:
            return [IsAdmin()]

    def get_queryset(self):
        queryset = super().get_queryset()

        if hasattr(self.request.user, 'trainer_profile'):
            queryset = queryset.filter(trainer=self.request.user.trainer_profile)

        schedule_id = self.request.query_params.get('schedule_id')
        if schedule_id:
            queryset = queryset.filter(schedule_id=schedule_id)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset.order_by('-created_date')

    def perform_destroy(self, instance):
        if instance.status != ChangeRequestStatus.PENDING.value:
            raise serializers.ValidationError({"detail": "Only pending change requests can be deleted."})

        schedule = instance.schedule
        if not WorkoutScheduleChangeRequest.objects.filter(
                schedule=schedule,
                status=ChangeRequestStatus.PENDING.value
        ).exclude(id=instance.id).exists():
            schedule.status = WorkoutScheduleStatus.SCHEDULED.value
            schedule.save()

        instance.delete()

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        change_request = self.get_object()

        if change_request.status != ChangeRequestStatus.PENDING.value:
            return Response(
                {"detail": "Only pending change requests can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        change_request.status = ChangeRequestStatus.REJECTED.value
        change_request.save()

        schedule = change_request.schedule
        if not WorkoutScheduleChangeRequest.objects.filter(
                schedule=schedule,
                status=ChangeRequestStatus.PENDING.value
        ).exists():
            schedule.status = WorkoutScheduleStatus.SCHEDULED.value
            schedule.save()

        return Response(
            {"detail": "Change request cancelled successfully."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'],
            permission_classes=[IsMember, IsMemberOwner],
            serializer_class=MemberResponseToChangeRequestSerializer)
    def member_response(self, request, pk=None):
        change_request = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        response = data['response']
        reason = data.get('reason', '')

        if change_request.status != ChangeRequestStatus.PENDING.value:
            return Response(
                {"detail": "This change request has already been processed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if response == 'ACCEPT':
            schedule = change_request.schedule
            schedule.scheduled_at = change_request.proposed_time
            schedule.status = WorkoutScheduleStatus.CHANGED.value
            schedule.save()

            change_request.status = ChangeRequestStatus.ACCEPTED.value
            change_request.save()

            WorkoutScheduleChangeRequest.objects.filter(
                schedule=schedule,
                status=ChangeRequestStatus.PENDING.value
            ).exclude(id=change_request.id).update(
                status=ChangeRequestStatus.REJECTED.value
            )

            return Response(
                {"detail": "Schedule change accepted successfully."},
                status=status.HTTP_200_OK
            )
        else:
            change_request.status = ChangeRequestStatus.REJECTED.value
            if reason:
                change_request.reason = f"Member rejection reason: {reason}"
            change_request.save()

            schedule = change_request.schedule
            if not WorkoutScheduleChangeRequest.objects.filter(
                    schedule=schedule,
                    status=ChangeRequestStatus.PENDING.value
            ).exists():
                schedule.status = WorkoutScheduleStatus.SCHEDULED.value
                schedule.save()

            return Response(
                {"detail": "Schedule change rejected."},
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['get'],
            permission_classes=[IsMember])
    def member_requests(self, request):
        # Lấy tất cả yêu cầu thay đổi liên quan đến member
        member = request.user.member_profile
        queryset = self.get_queryset().filter(
            schedule__subscription__member=member
        ).order_by('-created_date')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PaymentViewSet(viewsets.ViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_object(self):
        return get_object_or_404(Payment, pk=self.kwargs['pk'])

    def create(self, request):
        serializer = PaymentCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        payment = Payment.objects.create(
            subscription_id=serializer.validated_data['subscription_id'],
            amount=serializer.validated_data['amount'],
            payment_method=PaymentMethod.BANK_TRANSFER,
            payment_status=PaymentStatus.PENDING
        )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        payment = self.get_object()

        payment.mark_payment_completed()

        return Response(
            {'status': 'confirmed'},
            status=status.HTTP_200_OK
        )


class PTDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not hasattr(user, 'trainer_profile'):
            return Response({"detail": "Only PTs can access this dashboard."}, status=403)

        trainer = user.trainer_profile

        serializer = PTDashboardSerializer(trainer, context={"request": request})
        return Response(serializer.data)


class ReviewViewSet(viewsets.ViewSet, generics.CreateAPIView):
    pagination_class = Pagination
    # permission_classes = [ReviewPermission]

    def get_permissions(self):
        if self.action in ['list', 'list_gym_feedbacks', 'get_replies']:
            return [permissions.AllowAny()]
        elif self.action == 'destroy':
            return [IsOwnerOrAdmin()]
        elif self.action == 'create':
            return [IsMember()]
        return super().get_permissions()

    # def get_permissions(self):
    #     if self.request.method == 'POST':
    #         return [IsMember()]
    #     elif self.request.method == 'DELETE':
    #         return [IsMember(), IsReviewOwner()]
    #     return []

    def get_serializer_class(self):
        if self.request.method in ['POST']:
            return ReviewSerializer
        return ReviewDisplaySerializer

    def get_queryset(self):
        return Review.objects.filter(parent_comment__isnull=True, deleted_date__isnull=True) \
            .annotate(reply_count=Count('replies')) \
            .select_related('reviewer__user', 'training_package', 'trainer')

    def create(self, request):
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(ReviewDisplaySerializer(review, context={'request': request}).data, status=201)

    def destroy(self, request, pk=None):
        review = get_object_or_404(Review, pk=pk, reviewer=request.user.member_profile)
        review.soft_delete()  # giả sử bạn đang dùng soft delete
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='gym-feedbacks')
    def list_gym_feedbacks(self, request):
        queryset = self.get_queryset().filter(trainer__isnull=True, training_package__isnull=True)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ReviewDisplaySerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['get'], url_path='replies')
    def get_replies(self, request, pk=None):
        parent = get_object_or_404(Review, pk=pk, deleted_date__isnull=True)
        replies = parent.replies.filter(deleted_date__isnull=True)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(replies, request)
        serializer = ReviewDisplaySerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


#--------------------------------------------------------------------------------#
#-------------------------------VNPAY----------------------------------------#
class PaymentView(APIView):
    def get(self, request):
        return render(request, "payment.html", {"title": "Thanh toán"})

    def post(self, request):
        serializer = PaymentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            subscription = Subscription.objects.get(id=serializer.validated_data['subscription_id'])

            # Tạo payment record trạng thái PENDING trước khi gửi yêu cầu VNPay
            payment = Payment.objects.create(
                subscription=subscription,
                amount=subscription.total_cost,
                payment_method=PaymentMethod.BANK_TRANSFER,
                payment_status=PaymentStatus.PENDING
            )

            vnp = VNPay()
            vnp.requestData = {
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': settings.VNPAY_CONFIG['vnp_TmnCode'],
                'vnp_Amount': int(subscription.total_cost * 100),
                'vnp_CurrCode': 'VND',
                'vnp_TxnRef': str(payment.id),  # Sử dụng payment.id thay vì subscription.id
                'vnp_OrderInfo': f"Thanh toan goi {subscription.training_package.name}",
                'vnp_OrderType': 'subscription',
                'vnp_Locale': serializer.validated_data.get('language', 'vn'),
                'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
                'vnp_IpAddr': get_client_ip(request),

                'vnp_ReturnUrl': settings.VNPAY_CONFIG['vnp_ReturnUrl']
            }


            if serializer.validated_data.get('bank_code'):
                vnp.requestData['vnp_BankCode'] = serializer.validated_data['bank_code']

            payment_url = vnp.get_payment_url()
            return Response({
                "payment_url": payment_url,
                "payment_id": payment.id
            }, status=status.HTTP_200_OK)

        except Subscription.DoesNotExist:
            return Response({"error": "Subscription not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentReturnView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not request.user.is_authenticated:
            raise AuthenticationFailed("Unauthorized")

        input_data = request.GET
        print("Input Data:", input_data)
        if not input_data:
            return Response(
                {"error": "No data received from VNPay"},
                status=status.HTTP_400_BAD_REQUEST
            )

        vnp = VNPay()
        vnp.responseData = input_data.dict()
        print("VNPay Response Data:", vnp.responseData)

        # Validate the response checksum
        if not vnp.validate_response():
            return Response(
                {
                    "result": "error",
                    "message": "Invalid checksum",
                    "data": input_data.dict()
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Extract payment information
            payment_id = input_data['vnp_TxnRef']
            amount = float(input_data['vnp_Amount']) / 100  # Convert from VND to actual amount
            response_code = input_data['vnp_ResponseCode']

            # Get payment record
            payment = Payment.objects.get(id=payment_id)

            # Verify amount matches
            if amount != float(payment.amount):
                payment.payment_status = PaymentStatus.FAILED
                payment.save()
                return Response(
                    {
                        "result": "error",
                        "message": "Amount mismatch",
                        "payment_id": payment_id,
                        "expected_amount": payment.amount,
                        "received_amount": amount
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update payment status based on response code
            if response_code == '00':  # Success code
                payment.payment_status = PaymentStatus.COMPLETED
                payment.transaction_id = input_data.get('vnp_TransactionNo', '')
                payment.payment_date = datetime.strptime(
                    input_data.get('vnp_PayDate', ''),
                    '%Y%m%d%H%M%S'
                ) if input_data.get('vnp_PayDate') else None
                payment.receipt_url = input_data.get('vnp_PayUrl', '')

                # Activate subscription if payment is successful
                subscription = payment.subscription
                subscription.mark_as_active()
                subscription.save()
            else:
                payment.payment_status = PaymentStatus.FAILED

            payment.save()

            # Prepare response data - user-friendly format
            return Response(
                {
                    "status": "success" if payment.payment_status == PaymentStatus.COMPLETED else "failed",
                    "order_id": payment_id,
                    "amount": amount,
                    "message": "Payment successful" if response_code == '00' else "Payment failed",
                    "transaction_id": payment.transaction_id,
                    "payment_date": payment.payment_date,
                    "subscription_status": payment.subscription.get_status_display()
                },
                status=status.HTTP_200_OK
            )

        except Payment.DoesNotExist:
            return Response(
                {
                    "result": "error",
                    "message": f"Payment with ID {payment_id} not found",
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {
                    "result": "error",
                    "message": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentIPNView(APIView):
    def get(self, request):
        inputData = request.GET
        if not inputData:
            return Response({'RspCode': '99', 'Message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

        vnp = VNPay()
        vnp.responseData = inputData.dict()

        if not vnp.validate_response(settings.VNPAY_CONFIG['vnp_HashSecret']):
            return Response({'RspCode': '97', 'Message': 'Invalid Signature'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment_id = inputData['vnp_TxnRef']
            amount = float(inputData['vnp_Amount']) / 100

            # Cập nhật payment record từ IPN
            payment = Payment.objects.get(id=payment_id)
            payment.amount = amount
            payment.payment_status = PaymentStatus.COMPLETED if inputData['vnp_ResponseCode'] == '00' else PaymentStatus.FAILED
            payment.receipt_url = inputData.get('vnp_PayUrl', '')
            payment.save()

            if payment.payment_status == PaymentStatus.COMPLETED:
                payment.subscription.mark_as_active()

            return Response({'RspCode': '00', 'Message': 'Confirm Success'}, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({'RspCode': '01', 'Message': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'RspCode': '99', 'Message': f'Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdatePaymentStatusView(APIView):
    def post(self, request):
        payment_id = request.data.get("payment_id")
        payment_status = request.data.get("payment_status")

        if not payment_id or not payment_status:
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(id=payment_id)
            payment.payment_status = PaymentStatus[payment_status.upper()]
            payment.save()

            if payment.payment_status == PaymentStatus.COMPLETED:
                payment.subscription.mark_as_active()

            return Response({"message": "Payment status updated successfully"}, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

