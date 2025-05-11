from cloudinary.uploader import upload
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField
from rest_framework.serializers import ModelSerializer, Serializer
from django.utils import timezone
from .models import User, Trainer, Role, Member, WorkoutSchedule, TrainingType, WorkoutScheduleStatus, \
    WorkoutScheduleChangeRequest, TrainingPackage, Subscription, CategoryPackage, SubscriptionStatus, Payment
from .tasks import send_email_async
from datetime import timedelta
from django.db.models import Q
from django import forms



class UserSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'avatar', "role"]
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


class CurrentUserSerializer(ModelSerializer):
    avatar = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar', 'phone', 'email', 'role']

    def get_avatar(self, obj):
        return obj.avatar_url


class UpdateUserSerializer(ModelSerializer):
    avatar = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ["first_name", "last_name", "avatar", "phone", "email"]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def get_avatar(self, obj):
        return obj.avatar_url


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


class MemberHealthUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['gender', 'birth_year', 'height', 'weight', 'goal']


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


class CategoryPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryPackage
        fields = '__all__'


class TrainingPackageSerializer(serializers.ModelSerializer):
    pt = TrainerSerializer(read_only=True)
    member_count = serializers.IntegerField(read_only=True)
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
            'member_count',
        ]


class TrainingPackageDetailSerializer(TrainingPackageSerializer):
    subscribed = serializers.SerializerMethodField()

    def get_subscribed(self, training_package):
        request = self.context.get("request")
        user = request.user if request else None

        if user and user.is_authenticated and hasattr(user, "member_profile"):
            return Subscription.objects.filter(
                member=user.member_profile,
                training_package=training_package,
                active=True
            ).exists()

        return False

    class Meta:
        model = TrainingPackageSerializer.Meta.model
        fields = TrainingPackageSerializer.Meta.fields + ['subscribed']


class SubscriptionSerializer(serializers.ModelSerializer):
    training_package_name = serializers.CharField(source='training_package.name', read_only=True)
    pt_name = serializers.CharField(source='training_package.pt.user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'training_package_name', 'pt_name', 'start_date', 'end_date', 'status', 'status_display', 'total_cost', 'quantity']


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    training_package = serializers.PrimaryKeyRelatedField(queryset=TrainingPackage.objects.filter(active=True))
    start_date = serializers.DateField()
    quantity = serializers.IntegerField(required=False, min_value=1)

    class Meta:
        model = Subscription
        fields = ['training_package', 'start_date', 'quantity']

    def validate(self, attrs):
        user = self.context['request'].user

        if not hasattr(user, 'member_profile'):
            raise serializers.ValidationError("Chỉ hội viên mới có thể đăng ký gói tập.")

        member = user.member_profile
        training_package = attrs['training_package']

        existing = Subscription.objects.filter(
            member=member,
            training_package=training_package,
            status=SubscriptionStatus.ACTIVE,
            end_date__gte=timezone.now().date()
        ).exists()

        if existing:
            raise serializers.ValidationError("Bạn đã có gói tập này đang hoạt động.")

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        if not user.is_authenticated or not hasattr(user, 'member_profile'):
            raise serializers.ValidationError("Bạn cần đăng nhập bằng tài khoản hội viên.")
        member = user.member_profile
        package = validated_data['training_package']
        start_date = validated_data['start_date']
        quantity = validated_data.get('quantity', package.session_count)

        subscription = Subscription.objects.create(
            member=member,
            training_package=package,
            start_date=start_date,
            quantity=quantity,
            status=SubscriptionStatus.PENDING
        )

        return subscription



class WorkoutScheduleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutSchedule
        fields = ['id', 'subscription', 'training_type', 'scheduled_at', 'duration']
        read_only_fields = ['id']

    def validate_subscription(self, subscription):
        request = self.context.get("request")
        member = getattr(request.user, 'member_profile', None)
        if not member:
            raise serializers.ValidationError("Bạn không phải là hội viên.")

        if subscription.member != member:
            raise serializers.ValidationError("Gói tập không thuộc về bạn.")

        if subscription.status != SubscriptionStatus.ACTIVE:
            raise serializers.ValidationError("Gói tập không còn hiệu lực.")
        return subscription

    def validate(self, data):
        subscription = data.get('subscription')
        scheduled_at = data.get('scheduled_at')
        duration = data.get('duration')

        if scheduled_at and duration:
            end_time = scheduled_at + timedelta(minutes=duration)

            overlapping_schedules = WorkoutSchedule.objects.filter(
                subscription__member=subscription.member
            ).filter(
                Q(scheduled_at__lt=end_time,
                  scheduled_at__gte=scheduled_at) |
                Q(scheduled_at__gte=scheduled_at,
                  scheduled_at__lt=end_time) |
                Q(scheduled_at__lte=scheduled_at, scheduled_at__gte=end_time)
            )

            if overlapping_schedules.exists():
                raise serializers.ValidationError("Thời gian bạn chọn bị trùng với một buổi tập khác.")

        return data

    def create(self, validated_data):
        validated_data['status'] = WorkoutScheduleStatus.SCHEDULED.value
        return super().create(validated_data)


class WorkoutScheduleTrainerSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    package_name = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutSchedule
        fields = [
            'id',
            'training_type',
            'scheduled_at',
            'duration',
            'status',
            'member_name',
            'package_name',
        ]

    def get_member_name(self, obj):
        return obj.subscription.member.user.get_full_name()

    def get_package_name(self, obj):
        try:
            return obj.subscription.training_package.name
        except AttributeError:
            return None


class WorkoutScheduleWithTrainerSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source='subscription.training_package.pt.user.full_name', read_only=True)
    training_package_name = serializers.CharField(source='subscription.training_package.name', read_only=True)

    class Meta:
        model = WorkoutSchedule
        fields = ['id', 'subscription', 'training_type', 'scheduled_at', 'duration', 'trainer_name', 'training_package_name']
        read_only_fields = ['id']


#recheck
class WorkoutScheduleChangeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutScheduleChangeRequest
        fields = ['status']

    def validate_schedule(self, schedule):
        if schedule.status != WorkoutScheduleStatus.PENDING:
            raise serializers.ValidationError("Chỉ có thể yêu cầu thay đổi lịch đang chờ.")
        return schedule

    def create(self, validated_data):
        request = self.context['request']
        trainer = getattr(request.user, 'trainer_profile', None)
        if not trainer:
            raise serializers.ValidationError("Bạn không có quyền tạo yêu cầu này.")

        # Tạo yêu cầu thay đổi lịch tập
        return WorkoutScheduleChangeRequest.objects.create(
            trainer=trainer,
            **validated_data
        )

class WorkoutScheduleTrainerUpdateSerializer(serializers.Serializer):
    proposed_time = serializers.DateTimeField()
    reason = serializers.CharField(max_length=255)


#XỬ LÝ THANH TOÁNs
class PaymentCreateSerializer(serializers.ModelSerializer):
    subscription_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'subscription_id', 'amount', 'payment_method']
        read_only_fields = ['id', 'amount', 'payment_method']

    def validate(self, data):
        # Kiểm tra subscription hợp lệ
        subscription = Subscription.objects.filter(
            id=data['subscription_id'],
            status=SubscriptionStatus.PENDING
        ).first()

        if not subscription:
            raise serializers.ValidationError("Subscription không hợp lệ")

        data['amount'] = subscription.total_cost
        return data


class PaymentSerializer(serializers.ModelSerializer):
    subscription_info = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'payment_status', 'subscription_info']

    def get_subscription_info(self, obj):
        return {
            'package_name': obj.subscription.training_package.name,
            'duration': f"{obj.subscription.quantity} tháng"
        }


#VNPAY
class VNPayCreateSerializer(serializers.Serializer):
    subscription_id = serializers.IntegerField()
    bank_code = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate_subscription_id(self, value):
        if not Subscription.objects.filter(id=value).exists():
            raise serializers.ValidationError("Subscription không tồn tại.")
        return value

class PaymentForm(forms.Form):
    order_id = forms.CharField(max_length=250)
    order_type = forms.CharField(max_length=20)
    amount = forms.IntegerField()
    order_desc = forms.CharField(max_length=100)
    bank_code = forms.CharField(max_length=20, required=False)
    language = forms.CharField(max_length=2)

class PaymentRequestSerializer(serializers.Serializer):
    subscription_id = serializers.IntegerField()
    bank_code = serializers.CharField(required=False, max_length=20)
    language = serializers.CharField(default='vn', max_length=2)

class PaymentResponseSerializer(serializers.Serializer):
    vnp_TransactionNo = serializers.CharField()
    vnp_Amount = serializers.IntegerField()
    vnp_OrderInfo = serializers.CharField()
    vnp_ResponseCode = serializers.CharField()
    vnp_TransactionStatus = serializers.CharField()