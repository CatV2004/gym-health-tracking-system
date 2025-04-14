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


class TrainerRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    phone = serializers.CharField(source='user.phone')
    avatar = serializers.ImageField(source='user.avatar', required=False)

    certification = serializers.CharField()
    experience = serializers.IntegerField()

    class Meta:
        model = Trainer
        fields = [
            'username', 'first_name', 'last_name', 'email', 'phone', 'avatar',
            'certification', 'experience'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = Role.TRAINER.value
        avatar = user_data.pop('avatar', None)
        password = "pt@123"

        if avatar:
            try:
                result = upload(avatar, folder="gymcare")
                user_data['avatar'] = result.get('secure_url')
            except Exception as e:
                raise serializers.ValidationError({"avatar": f"Lỗi upload: {str(e)}"})

        user = User(
            **user_data
        )
        user.set_password(password)
        user.save()

        trainer = Trainer.objects.create(user=user, **validated_data)

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

    def to_representation(self, instance):
        return {
            "id": instance.user.id,
            "username": instance.user.username,
            "first_name": instance.user.first_name,
            "last_name": instance.user.last_name,
            "email": instance.user.email,
            "phone": instance.user.phone,
            "avatar": instance.user.avatar if instance.user.avatar else '',
            "role": instance.user.role,
            "certification": instance.certification,
            "experience": instance.experience
        }



class MemberSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Member
        fields = ["id", "user", "height", "weight", "goal", "birth_year", "gender"]

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


class MemberRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.role = Role.MEMBER.value
        user.save()

        member = Member.objects.create(user=user)
        return member

    def to_representation(self, instance):
        return {
            "id": instance.user.id,
            "username": instance.user.username,
            "first_name": instance.user.first_name,
            "last_name": instance.user.last_name,
            "avatar": instance.user.avatar if instance.user.avatar else '',
            "role": instance.user.role
        }


class TrainingPackageSerializer(serializers.ModelSerializer):
    pt = TrainerSerializer(read_only=True)
    class Meta:
        model = TrainingPackage
        fields = [
            'id',
            'name',
            'pt',
            'type_package',
            'category_package',
            'cost',
            'description',
            'session_count',
        ]


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


