from cloudinary.uploader import upload
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField
from rest_framework.serializers import ModelSerializer, Serializer
from django.utils import timezone
from .models import User, Trainer, Role, Member, WorkoutSchedule, TrainingType, WorkoutScheduleStatus, \
    WorkoutScheduleChangeRequest, TrainingPackage, Subscription
from .tasks import send_email_async


class UserSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name', 'avatar', "role"]
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': False
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()

        return u


class UpdateUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "avatar", "phone", "email"]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class TrainerSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Trainer
        fields = ["id", "user", "certification", "experience"]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = Role.TRANER.value
        avatar = user_data.pop('avatar', None)
        password = "pt@123"  # Mặc định cho PT

        if avatar:
            try:
                avatar_result = upload(avatar, folder="gymcare")
                user_data['avatar'] = avatar_result.get('secure_url')
            except Exception as e:
                raise ValidationError({"avatar": f"Lỗi đăng tải avatar: {str(e)}"})

        user = User.objects.create_user(
            username=user_data.get('username'),
            password=password,
            first_name=user_data.get('first_name'),
            last_name=user_data.get('last_name'),
            email=user_data.get('email'),
            avatar=user_data.get('avatar'),
            phone=user_data.get('phone'),
            role=user_data.get('role')
        )

        trainer = Trainer.objects.create(user=user, **validated_data)

        # Gửi email thông báo
        send_email_async.delay(
            subject="Tài khoản Huấn luyện viên đã được tạo",
            message=f"""
                    Chào {user.first_name},

                    Tài khoản PT của bạn đã được tạo. Vui lòng đăng nhập bằng:

                    Tên đăng nhập: {user.username}
                    Mật khẩu: {password}

                    Trân trọng,
                    GymCare Team
                    """,
            recipient_email=user.email,
        )

        return trainer


class MemberSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Member
        fields = ["id", "user", "height", "weight", "goal"]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = Role.MEMBER.value
        avatar = user_data.pop('avatar', None)
        password = user_data.get('password')

        if avatar:
            try:
                avatar_result = upload(avatar, folder="gymcare")
                user_data['avatar'] = avatar_result.get('secure_url')
            except Exception as e:
                raise ValidationError({"avatar": f"Lỗi đăng tải avatar: {str(e)}"})

        user = User.objects.create_user(
            username=user_data.get('username'),
            password=password,
            first_name=user_data.get('first_name'),
            last_name=user_data.get('last_name'),
            email=user_data.get('email'),
            avatar=user_data.get('avatar'),
            phone=user_data.get('phone'),
            role=user_data.get('role')
        )

        member = Member.objects.create(user=user, **validated_data)

        return member


class ChangePasswordSerializer(serializers.Serializer):
    current_password = CharField(write_only=True, required=True)
    new_password = CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu hiện tại không đúng.")
        return value


class TrainingPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingPackage
        fields = ['id', 'name', 'pt', 'type_package', 'start_date', 'end_date', 'total_cost']


class TrainingPackageDetailSerializer(TrainingPackageSerializer):
    subscribed = serializers.SerializerMethodField()

    def get_subscribed(self, training_package):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Subscription.objects.filter(
                member=request.user.member_profile,
                training_package=training_package,
                active=True
            ).exists()
        return False

    class Meta:
        model = TrainingPackageSerializer.Meta.model
        fields = TrainingPackageSerializer.Meta.fields + ['subscribed']


class MemberSubscriptionSerializer(serializers.ModelSerializer):
    training_package = TrainingPackageSerializer()

    class Meta:
        model = Subscription
        fields = ['id', 'member', 'training_package', 'active']


class WorkoutScheduleSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="subscription.member.user.username", read_only=True)

    class Meta:
        model = WorkoutSchedule
        fields = ["id", "member_name", "training_type", "scheduled_at", "duration", "status"]


class WorkoutScheduleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutSchedule
        fields = ['scheduled_at', 'duration']

    def validate_scheduled_at(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Không thể đặt lịch trong quá khứ.")
        return value


class WorkoutScheduleChangeRequestSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source="trainer.user.username", read_only=True)
    schedule_id = serializers.IntegerField(source="schedule.id", read_only=True)

    class Meta:
        model = WorkoutScheduleChangeRequest
        fields = ["id", "schedule_id", "trainer_name", "proposed_time", "reason", "status"]


