from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import serializers
from .models import User, Member, Trainer
from .pems import OwnerPermission, AdminPermission, TrainerPermission
from .serializers import UserSerializer, ChangePasswordSerializer, MemberSerializer, TrainerSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
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
        """Lấy danh sách PT chưa có lịch tập trong tuần hiện tại."""
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

    @action(detail=False, methods=['get'])
    def pending_progress(self, request):
        """Lấy danh sách hội viên có tiến độ tập luyện chưa được cập nhật."""
        members = Member.objects.filter(progress__isnull=True)
        serializer = self.get_serializer(members, many=True)
        return Response(serializer.data)