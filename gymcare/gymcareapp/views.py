from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User
from .pems import OwnerPermission
from .serializers import UserSerializer, ChangePasswordSerializer


class UserViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ["change_password", "get_current_user"]:
            return [OwnerPermission()]
        return [IsAuthenticated()]

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