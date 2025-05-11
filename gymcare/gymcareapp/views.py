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
from django.db.models import Count
from rest_framework.decorators import api_view
from .paginators import Pagination
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from . import serializers
from .models import *
from .pems import *
import json
import uuid
from .utils.vnpay_helper import VNPay, VNPayDatabase, get_client_ip
from .serializers import UserSerializer, CategoryPackageSerializer, TrainingPackageSerializer, \
    UpdateUserSerializer, TrainerSerializer, TrainerRegisterSerializer, MemberSerializer, \
    ChangePasswordSerializer, MemberRegisterSerializer, TrainingPackageDetailSerializer, \
    SubscriptionSerializer, SubscriptionCreateSerializer, WorkoutScheduleCreateSerializer, \
    WorkoutScheduleChangeRequestSerializer, WorkoutScheduleTrainerSerializer, WorkoutScheduleWithTrainerSerializer, \
    MemberHealthUpdateSerializer, CurrentUserSerializer, PaymentCreateSerializer, PaymentSerializer, \
    VNPayCreateSerializer, PaymentRequestSerializer
from django.db import transaction
from .utils.zalopay_helper import ZaloPayHelper
import requests
import hashlib
import hmac
import time
from django.conf import settings
from datetime import datetime



class ZaloPayOrderView(APIView):
    def post(self, request, pk):
        # 1. Tìm payment theo id
        payment = get_object_or_404(Payment, pk=pk)

        # 2. Tạo order để gửi lên ZaloPay
        try:
            app_id = settings.ZALOPAY_CONFIG["app_id"]
            key1 = settings.ZALOPAY_CONFIG["key1"]
            create_order_url = "https://sandbox.zalopay.com.vn/v001/tpe/createorder"  # link sandbox

            # 3. Các tham số ZaloPay yêu cầu
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

            # 4. Tính mac SHA256
            data = f"{order['app_id']}|{order['app_trans_id']}|{order['app_user']}|{order['amount']}|{order['app_user']}|{order['description']}|{order['bank_code']}|{order['item']}|{order['embed_data']}|{order['callback_url']}"
            mac = hmac.new(key1.encode(), data.encode(), hashlib.sha256).hexdigest()
            order['mac'] = mac

            # 5. Gửi request lên ZaloPay
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            response = requests.post(create_order_url, data=order, headers=headers)

            res_data = response.json()

            if res_data.get("return_code") == 1:
                # Thành công
                order_url = res_data.get("order_url")
                return Response({"order_url": order_url}, status=status.HTTP_200_OK)
            else:
                return Response({"error": res_data.get("return_message")}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    def get_serializer_class(self):
        if self.action == 'change_password':
            return ChangePasswordSerializer
        elif self.action in ['update', 'partial_update']:
            return serializers.UpdateUserSerializer
        elif self.action == 'get_current_user':
            return serializers.CurrentUserSerializer
        return serializers.UserSerializer

    def get_permissions(self):
        if self.request.method == 'GET' and self.action == 'get_all_users' and self.action == 'get_user_by_id':
            return [IsAuthenticated ()]
        elif self.request.method in ['PATCH', 'PUT'] or self.action == 'get_current_user':
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
        elif self.action == 'respond_change_request':
            return WorkoutScheduleChangeRequestSerializer
        return TrainerSerializer

    def get_permissions(self):
        if self.action == ['create','destroy','workout_schedules']:
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
            subscription__training_package__pt=trainer,
            training_type = TrainingType.PERSONAL_TRAINER.value
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
        elif self.action == 'get_member_workout_schedules':
            return WorkoutScheduleWithTrainerSerializer
        elif self.action in ['update_health_info', 'get_health_info']:
            return MemberHealthUpdateSerializer
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

        serializer = WorkoutScheduleWithTrainerSerializer(schedules, many=True)

        return Response({
            "message": "Danh sách lịch tập của hội viên.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


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
            "data": SubscriptionSerializer(subscription).data
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


class MemberChangeRequestViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WorkoutScheduleChangeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutScheduleChangeRequest.objects.filter(
            schedule__subscription__member__user=self.request.user
        ).order_by("-created_date")

    @action(detail=True, methods=["post"], url_path="accept")
    def accept_schedule_change(self, request, pk=None):
        change_request = self.get_object()

        if change_request.schedule.subscription.member.user != request.user:
            return Response({"detail": "Không có quyền thực hiện."}, status=403)

        if change_request.status != ChangeRequestStatus.PENDING:
            return Response({"detail": "Yêu cầu đã được xử lý trước đó."}, status=400)

        schedule = change_request.schedule
        schedule.scheduled_at = change_request.proposed_time
        schedule.status = WorkoutScheduleStatus.CHANGED
        schedule.save()

        change_request.status = ChangeRequestStatus.ACCEPTED
        change_request.save()

        return Response({"detail": "Bạn đã chấp nhận lịch tập mới."}, status=200)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject_schedule_change(self, request, pk=None):
        change_request = self.get_object()

        if change_request.schedule.subscription.member.user != request.user:
            return Response({"detail": "Không có quyền thực hiện."}, status=403)

        if change_request.status != ChangeRequestStatus.PENDING:
            return Response({"detail": "Yêu cầu đã được xử lý trước đó."}, status=400)

        change_request.status = ChangeRequestStatus.REJECTED
        change_request.save()

        schedule = change_request.schedule
        schedule.status = WorkoutScheduleStatus.SCHEDULED
        schedule.save()

        return Response({"detail": "Bạn đã từ chối lịch tập mới."}, status=200)


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

