from cloudinary.uploader import upload
from rest_framework import serializers, validators
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField
from rest_framework.serializers import ModelSerializer, Serializer
from django.utils import timezone
from .models import User, Trainer, Role, Member, WorkoutSchedule, TrainingType, WorkoutScheduleStatus, \
    WorkoutScheduleChangeRequest, TrainingPackage, Subscription, CategoryPackage, SubscriptionStatus, Payment, \
    WorkoutProgress, Review, ChangeRequestStatus
from .tasks import send_email_async
from datetime import timedelta
from django.db.models import Q
from django import forms
from datetime import datetime
import re


class UserSerializer(ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'avatar', "role"]
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': False
            }
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username đã được sử dụng.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 6 ký tự.")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    def create(self, validated_data):
        data = validated_data.copy()
        avatar_file = data.pop('avatar', None)
        u = User(**data)
        u.set_password(u.password)
        if avatar_file:
            u.avatar = avatar_file
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
    avatar = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = User
        fields = ["first_name", "last_name", "avatar", "phone", "email"]

    def validate(self, attrs):
        user = self.instance
        phone = attrs.get("phone")
        email = attrs.get("email")

        if email and User.objects.exclude(id=user.id).filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email đã được sử dụng."})

        if phone:
            if not re.match(r"^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$", phone):
                raise serializers.ValidationError({"phone": "Số điện thoại không hợp lệ."})

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar_url
        return data

    def update(self, instance, validated_data):
        avatar_file = validated_data.pop('avatar', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if avatar_file:
            instance.avatar = avatar_file
        instance.save()
        return instance

    def get_avatar(self, obj):
        return obj.avatar_url


class TrainerSerializer(ModelSerializer):
    user = UserSerializer()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    user_has_rated = serializers.SerializerMethodField()

    class Meta:
        model = Trainer
        # fields = '__all__'
        fields = ["id", "user", "certification", "experience", 'average_rating', 'total_reviews', 'user_has_rated']
        read_only_fields = ('average_rating', 'total_reviews', 'user_has_rated')

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = Review.objects.filter(
            trainer=obj,
            parent_comment__isnull=True,
            deleted_date__isnull=True
        ).aggregate(avg=Avg('rating'))['avg']
        return round(avg, 2) if avg else 0.0

    def get_total_reviews(self, obj):
        from django.db.models import Count
        return Review.objects.filter(
            trainer=obj,
            parent_comment__isnull=True,
            deleted_date__isnull=True
        ).count()

    def get_user_has_rated(self, obj):
        # Kiểm tra request có trong context không
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = getattr(request.user, 'member_profile', None)
            if member:
                return Review.objects.filter(
                    trainer=obj,
                    reviewer=member,
                    deleted_date__isnull=True
                ).exists()
        return False

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

    def validate(self, data):
        user_data = data.get('user', {})
        username = user_data.get('username')
        email = user_data.get('email')
        phone = user_data.get('phone')

        if username and User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "Tên đăng nhập đã được sử dụng."})

        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email đã được đăng ký."})

        if phone and User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError({"phone": "Số điện thoại đã được sử dụng."})

        if phone and not re.match(r"^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$", phone):
            raise serializers.ValidationError({"phone": "Số điện thoại không hợp lệ."})

        return data

    def validate_certification(self, value):
        if not value.strip():
            raise serializers.ValidationError("Chứng chỉ không được để trống.")
        return value

    def validate_experience(self, value):
        if value < 0:
            raise serializers.ValidationError("Kinh nghiệm không thể âm.")
        if value > 50:
            raise serializers.ValidationError("Kinh nghiệm không hợp lệ (quá 50 năm).")
        return value

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = Role.TRAINER.value
        avatar = user_data.pop('avatar', None)
        password = "pt@123"

        if avatar:
            try:
                result = upload(avatar, folder="gymcare/avatar/trainer")
                user_data['avatar'] = result.get('secure_url')
            except Exception as e:
                raise serializers.ValidationError({"avatar": f"Lỗi upload: {str(e)}"})

        user = User(**user_data)
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


    def validate_birth_year(self, value):
        current_year = datetime.now().year
        if value < 1900 or value > current_year:
            raise serializers.ValidationError("Năm sinh không hợp lệ.")
        return value

    def validate(self, data):
        if data.get("weight") and data.get("weight") <= 0:
            raise serializers.ValidationError({"weight": "Cân nặng phải lớn hơn 0."})
        if data.get("height") and data.get("height") <= 0:
            raise serializers.ValidationError({"height": "Chiều cao phải lớn hơn 0."})
        return data

    def create(self, validated_data):
        user_data = validated_data.pop('user')

        required_user_fields = ["username", "password", "first_name", "last_name"]
        missing_fields = [f for f in required_user_fields if not user_data.get(f)]
        if missing_fields:
            raise serializers.ValidationError({
                "user": f"Các trường bắt buộc còn thiếu: {', '.join(missing_fields)}"
            })

        user_data['role'] = Role.MEMBER.value
        avatar = user_data.pop('avatar', None)
        password = user_data.get('password')

        if avatar:
            try:
                avatar_result = upload(avatar, folder="gymcare/member/avatar")
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

    def validate_birth_year(self, value):
        current_year = datetime.now().year
        if value < 1900 or value > current_year:
            raise serializers.ValidationError(f"Năm sinh phải trong khoảng 1900 đến {current_year}.")
        return value

    def validate_height(self, value):
        if value <= 0 or value > 300:
            raise serializers.ValidationError("Chiều cao phải lớn hơn 0 và nhỏ hơn 300 cm.")
        return value

    def validate_weight(self, value):
        if value <= 0 or value > 500:
            raise serializers.ValidationError("Cân nặng phải lớn hơn 0 và nhỏ hơn 500 kg.")
        return value

    def validate_goal(self, value):
        if not value.strip():
            raise serializers.ValidationError("Mục tiêu không được để trống.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = CharField(write_only=True, required=True)
    new_password = CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu hiện tại không đúng.")
        return value


class MemberRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'username': {
                'validators': [
                    validators.UniqueValidator(queryset=User.objects.all(), message="Tên đăng nập đã được sử dụng.")]
            }
        }

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
    average_rating = serializers.SerializerMethodField(read_only=True)
    total_reviews = serializers.SerializerMethodField(read_only=True)

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
            'average_rating',
            'total_reviews'
        ]
        read_only_fields = ('pt', 'member_count', 'average_rating', 'total_reviews')

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = Review.objects.filter(
            training_package=obj,
            parent_comment__isnull=True,
            deleted_date__isnull=True
        ).aggregate(avg=Avg('rating'))['avg']
        return round(avg, 2) if avg else 0.0

    def get_total_reviews(self, obj):
        from django.db.models import Count
        return Review.objects.filter(
            training_package=obj,
            parent_comment__isnull=True,
            deleted_date__isnull=True
        ).count()



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
    training_package = TrainingPackageSerializer()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    user_has_rated = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'training_package', 'start_date', 'end_date',
            'status', 'status_display', 'total_cost', 'quantity', 'user_has_rated'
        ]

    def get_user_has_rated(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = getattr(request.user, 'member_profile', None)
            if member:
                return Review.objects.filter(
                    reviewer=member,
                    training_package=obj.training_package,
                    deleted_date__isnull=True
                ).exists()
        return False

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


class WorkoutScheduleSerializer(serializers.ModelSerializer):
    subscription = serializers.PrimaryKeyRelatedField(queryset=Subscription.objects.all())
    training_type = serializers.ChoiceField(choices=TrainingType.choices())
    scheduled_at = serializers.DateTimeField()
    duration = serializers.IntegerField(min_value=1)
    packageId = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutSchedule
        fields = ["id", "subscription", "training_type", "scheduled_at", "duration", "status", "packageId"]
        read_only_fields = ["id", "packageId"]

    def validate_scheduled_at(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Thời gian tập phải nằm trong tương lai.")
        return value

    def validate(self, attrs):
        subscription = attrs.get("subscription", getattr(self.instance, "subscription", None))
        scheduled_at = attrs.get("scheduled_at", getattr(self.instance, "scheduled_at", None))
        duration = attrs.get("duration", getattr(self.instance, "duration", None))

        if scheduled_at and duration:
            scheduled_end = scheduled_at + timezone.timedelta(minutes=duration)

            overlapping = WorkoutSchedule.objects.filter(
                subscription=subscription,
                status__in=[
                    WorkoutScheduleStatus.SCHEDULED.value,
                    WorkoutScheduleStatus.PENDING_CHANGE.value,
                    WorkoutScheduleStatus.CHANGED.value
                ]
            ).exclude(id=getattr(self.instance, "id", None))
            overlapping = overlapping.filter(
                Q(scheduled_at__lt=scheduled_end) &
                Q(scheduled_at__gte=scheduled_at - timezone.timedelta(minutes=duration))
            )

            if overlapping.exists():
                raise serializers.ValidationError("Thời gian đã có lịch tập khác được đặt.")

        return attrs

    def create(self, validated_data):
        validated_data['status'] = WorkoutScheduleStatus.SCHEDULED.value
        return super().create(validated_data)

    def get_packageId(self, obj):
        return obj.subscription.training_package.id if obj.subscription else None


class WorkoutScheduleChangeRequestSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source='trainer.user.get_full_name', read_only=True)
    member_name = serializers.CharField(source='schedule.subscription.member.user.get_full_name', read_only=True)
    current_schedule_time = serializers.DateTimeField(source='schedule.scheduled_at', read_only=True)

    class Meta:
        model = WorkoutScheduleChangeRequest
        fields = [
            'id',
            'schedule',
            'trainer',
            'trainer_name',
            'member_name',
            'current_schedule_time',
            'proposed_time',
            'reason',
            'status',
            'created_date',
            'updated_date'
        ]
        extra_kwargs = {
            'trainer': {'read_only': True},
            'status': {'read_only': True},
        }

    def validate(self, data):
        # Ensure proposed_time is in the future
        if 'proposed_time' in data and data['proposed_time'] <= timezone.now():
            raise serializers.ValidationError({"proposed_time": "Proposed time must be in the future."})

        # Ensure schedule exists and is not cancelled/completed
        schedule = data.get('schedule')
        if schedule:
            if schedule.status in [WorkoutScheduleStatus.COMPLETED.value, WorkoutScheduleStatus.CANCELLED.value]:
                raise serializers.ValidationError(
                    {"schedule": "Cannot request changes for completed or cancelled sessions."})

            # Ensure the trainer is assigned to this schedule (for personal training)
            if schedule.training_type == TrainingType.PERSONAL_TRAINER.value:
                if not hasattr(self.context['request'].user, 'trainer_profile'):
                    raise serializers.ValidationError(
                        {"schedule": "Only assigned trainers can request changes for personal training sessions."})

                # If this is an update, check existing trainer matches
                instance = self.instance
                if instance and instance.trainer != self.context['request'].user.trainer_profile:
                    raise serializers.ValidationError({"schedule": "You can only modify your own change requests."})

        return data

    def create(self, validated_data):
        request = self.context['request']
        validated_data['trainer'] = request.user.trainer_profile
        change_request = super().create(validated_data)

        # Update schedule status to PENDING_CHANGE
        schedule = change_request.schedule
        schedule.status = WorkoutScheduleStatus.PENDING_CHANGE.value
        schedule.save()

        return change_request


class MemberResponseToChangeRequestSerializer(serializers.Serializer):
    response = serializers.ChoiceField(
        choices=['ACCEPT', 'REJECT'],
        required=True
    )
    # reason = serializers.CharField(required=False, allow_blank=True)

    # def validate(self, data):
    #     if data['response'] == 'REJECT' and not data.get('reason'):
    #         raise serializers.ValidationError({"reason": "Reason is required when rejecting a change request."})
    #     return data

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

class WorkoutProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutProgress
        fields = ["id", "weight_kg", "body_fat", "muscle_mass", "notes", "created_date"]
        read_only_fields = ["id", "created_date"]



#PTDashboardView
class PriorityMemberSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name')
    class Meta:
        model = Member
        fields = ['id', 'full_name', 'goal', 'weight', 'height']

class PTDashboardSerializer(serializers.Serializer):
    total_members = serializers.SerializerMethodField()
    sessions_today = serializers.SerializerMethodField()
    pending_approvals = serializers.SerializerMethodField()
    upcoming_sessions = serializers.SerializerMethodField()
    priority_members = serializers.SerializerMethodField()

    def get_total_members(self, trainer):
        subscriptions = Subscription.objects.filter(
            training_package__pt=trainer,
            training_package__pt__active=True,
        )
        return subscriptions.values('member').distinct().count()

    def get_sessions_today(self, trainer):
        today = timezone.now().date()
        return WorkoutSchedule.objects.filter(
            status__in=[
                WorkoutScheduleStatus.CHANGED.value,
                WorkoutScheduleStatus.APPROVED.value,
                WorkoutScheduleStatus.COMPLETED.value,
            ],
            subscription__training_package__pt=trainer,
            scheduled_at__date=today
        ).count()

    def get_pending_approvals(self, trainer):
        return WorkoutSchedule.objects.filter(
            subscription__training_package__pt=trainer,
            training_type=TrainingType.PERSONAL_TRAINER.value,
            status=WorkoutScheduleStatus.SCHEDULED.value
        ).values('subscription__member').distinct().count()

    def get_upcoming_sessions(self, trainer):
        upcoming = WorkoutSchedule.objects.filter(
            subscription__training_package__pt=trainer,
            scheduled_at__gte=timezone.now(),
            scheduled_at__lte=timezone.now() + timedelta(days=3),
            status__in = [
                WorkoutScheduleStatus.CHANGED.value,
                WorkoutScheduleStatus.APPROVED.value,
                WorkoutScheduleStatus.COMPLETED.value,
        ],
        ).order_by('scheduled_at')[:5]
        return WorkoutScheduleSerializer(upcoming, many=True).data

    def get_priority_members(self, trainer):
        subscriptions = Subscription.objects.filter(training_package__pt=trainer)
        priority = Member.objects.filter(
            subscriptions__in=subscriptions
        ).filter(
            Q(goal__isnull=False) | Q(weight__gte=100)
        ).distinct()[:5]
        return PriorityMemberSerializer(priority, many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id',
            'reviewer',
            'trainer',
            'training_package',
            'gym_feedback',
            'parent_comment',
            'comment',
            'rating',
            'created_date',
        ]
        read_only_fields = ['id', 'reviewer', 'created_date']

    def validate(self, data):
        user = self.context['request'].user
        member = getattr(user, 'member_profile', None)
        if not member:
            raise serializers.ValidationError("Người dùng không phải là hội viên.")

        trainer = data.get('trainer')
        package = data.get('training_package')
        gym_feedback = data.get('gym_feedback')

        if not any([trainer, package, gym_feedback]):
            raise serializers.ValidationError("Bạn phải đánh giá ít nhất một đối tượng (trainer, gói tập hoặc phòng gym).")

        # Kiểm tra điều kiện nếu có trainer
        if trainer:
            has_subscribed = Subscription.objects.filter(
                member=member,
                training_package__pt=trainer
            ).exists()
            if not has_subscribed:
                raise serializers.ValidationError("Bạn không thể đánh giá huấn luyện viên này nếu chưa từng đăng ký gói tập với họ.")

        # Kiểm tra điều kiện nếu có training_package
        if package:
            has_subscribed = Subscription.objects.filter(
                member=member,
                training_package=package
            ).exists()
            if not has_subscribed:
                raise serializers.ValidationError("Bạn không thể đánh giá gói tập này nếu chưa từng đăng ký.")

        # Nếu rating thấp thì bắt buộc có comment
        rating = data.get('rating')
        comment = data.get('comment')
        if rating is not None and rating <= 2 and not comment:
            raise serializers.ValidationError("Cần nhập nhận xét khi đánh giá từ 2 sao trở xuống.")

        return data

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user.member_profile
        return super().create(validated_data)


class ReviewDisplaySerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.user.username', read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'reviewer_name', 'comment', 'rating', 'created_date',
            'reply_count'
        ]

    def get_reply_count(self, obj):
        return obj.replies.filter(deleted_date__isnull=True).count()


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