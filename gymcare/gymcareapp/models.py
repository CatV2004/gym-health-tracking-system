from datetime import datetime
import logging

from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from enum import IntEnum, Enum

from django.utils.timezone import now

class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    deleted_date = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ["-id"]

    def soft_delete(self, using=None, keep_parents=False):
        self.deleted_date = timezone.now()
        self.active = False
        self.save(update_fields=['deleted_date', 'active'])

    def restore(self, using=None, keep_parents=False):
        self.deleted_date = None
        self.active = True
        self.save(update_fields=['deleted_date', 'active'])

class Role(IntEnum):
    ADMIN = 0
    TRAINER = 1
    MEMBER = 2

    @classmethod
    def choices(cls):
        return [(role.value, role.name.capitalize()) for role in cls]


class User(AbstractUser):
    avatar = CloudinaryField('avatar', blank=False, folder='gymcare',
                             default='https://res.cloudinary.com/dohsfqs6d/image/upload/v1742786537/gymcare/user.png')
    phone = models.CharField(max_length=10, unique=True, null=True,
                             validators=[RegexValidator(regex=r'^\d{10}$', message="Số điện thoại phải có 10 chữ số.")])
    email = models.EmailField(max_length=50,unique=True, null=True, blank=False)
    role = models.IntegerField(
        choices=Role.choices(),
        default=Role.ADMIN.value
    )

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.username


class Trainer(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="trainer_profile")
    certification = RichTextField(config_name='basic', null=True, blank=True)
    experience = models.IntegerField(default=0, null=True, blank=True)

    def clean(self):
        super().clean()
        if self.experience is not None and self.experience < 0:
            raise ValidationError({"experience": "Experience cannot be negative."})

    def __str__(self):
        return f"PT: {self.user.username}"

class GenderEnum(Enum):
    MALE = 'M'
    FEMALE = 'F'

    @classmethod
    def choices(cls):
        return [(tag.value, tag.name.capitalize()) for tag in cls]

class Member(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="member_profile")
    gender = models.CharField(
        max_length=1,
        choices=GenderEnum.choices(),
        null=True,
        blank=True
    )
    birth_year = models.IntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    goal = models.TextField(null=True, blank=True)

    def clean(self):
        super().clean()
        if self.birth_year:
            current_year = now().year
            if self.birth_year < 1900 or self.birth_year >= current_year:
                raise ValidationError({
                    "birth_year": f"Invalid year of birth! Please enter from 1900 to {current_year}."
                })
    def __str__(self):
        return f"Member: {self.user.username}"


class TypePackage(IntEnum):
    MONTH = 0
    QUARTER = 1
    YEAR = 2

    @classmethod
    def choices(cls):
        return [(package.value, package.name.capitalize()) for package in cls]


class CategoryPackage(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class TrainingPackage(BaseModel):
    name = models.CharField(max_length=128, null=False, unique=True)
    pt = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, blank=True, related_name="training_packages")
    type_package = models.IntegerField(choices=TypePackage.choices(), default=TypePackage.MONTH)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    description = models.TextField(null=True, blank=True)
    session_count = models.IntegerField(default=1)
    category_package = models.ForeignKey(CategoryPackage, on_delete=models.SET_NULL, null=True, blank=True,
                                         related_name="packages")
    def __str__(self):
        return f"{self.name} ({self.pt})"


class WorkoutProgress(BaseModel):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="progresses")
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=False)
    body_fat = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    muscle_mass = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    recorded_by = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, blank=True, related_name="progresses")

    class Meta:
        verbose_name = "Workout Progress"
        verbose_name_plural = "Workout Progresses"
        ordering = ["-created_date"]

    def clean(self):
        super().clean()
        if self.weight_kg <= 0:
            raise ValidationError({"weight_kg": "Weight must be greater than 0."})
        if self.body_fat is not None and (self.body_fat < 0 or self.body_fat > 100):
            raise ValidationError({"body_fat": "Body fat percentage must be between 0 and 100."})
        if self.muscle_mass is not None and self.muscle_mass < 0:
            raise ValidationError({"muscle_mass": "Muscle mass must be a positive value."})

    def __str__(self):
        member_name = self.member.user.username if self.member else "Unknown Member"
        date_str = self.created_date.strftime('%Y-%m-%d') if self.created_date else "Unknown Date"
        return f"Progress of {member_name} on {date_str}"


class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)


class SubscriptionStatus(models.IntegerChoices):
    ACTIVE = 1, "Active"
    EXPIRED = 2, "Expired"
    CANCELLED = 3, "Cancelled"
    PENDING = 4, "Pending"


class Subscription(BaseModel):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="subscriptions")
    training_package = models.ForeignKey(TrainingPackage, on_delete=models.CASCADE, related_name="subscriptions")
    start_date = models.DateField(null=True, default=timezone.now)
    end_date = models.DateField(null=True, blank=True)  # Sẽ được tính tự động nếu không được cung cấp
    status = models.IntegerField(choices=SubscriptionStatus.choices, default=SubscriptionStatus.ACTIVE)
    total_cost = models.DecimalField(null=True, max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError({"end_date": "End date must be after start date."})

    def save(self, *args, **kwargs):
        if self.start_date and not self.end_date and self.training_package:
            if self.training_package.type_package == TypePackage.MONTH.value:
                self.end_date = self.start_date + relativedelta(months=+self.quantity)
            elif self.training_package.type_package == TypePackage.QUARTER.value:
                self.end_date = self.start_date + relativedelta(months=+3 * self.quantity)
            elif self.training_package.type_package == TypePackage.YEAR.value:
                self.end_date = self.start_date + relativedelta(years=+self.quantity)
            else:
                self.end_date = self.start_date + relativedelta(months=+self.quantity)

        if self.training_package:
            self.total_cost = self.training_package.cost * self.quantity

        super().save(*args, **kwargs)

    # def __str__(self):
    #     return f"Subscription of {self.member.user.username} for {self.training_package.name}"


class PaymentStatus(IntEnum):
    PENDING = 0
    COMPLETED = 1
    FAILED = 2

    @classmethod
    def choices(cls):
        return [(status.value, status.name.capitalize()) for status in cls]


class PaymentMethod(IntEnum):
    CASH = 0
    CREDIT_CARD = 1
    BANK_TRANSFER = 2

    @classmethod
    def choices(cls):
        return [(method.value, method.name.replace("_", " ").capitalize()) for method in cls]


class Payment(BaseModel):
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    payment_method = models.IntegerField(choices=PaymentMethod.choices(), null=False)
    payment_status = models.IntegerField(choices=PaymentStatus.choices(), default=PaymentStatus.PENDING.value)
    receipt_url = CloudinaryField(null = True)

    def __str__(self):
        return f"Payment for {self.subscription.member.user.username} - {self.get_payment_status_display()}"

    def clean(self):
        if self.amount < 0:
            raise ValidationError({"amount": "Amount cannot be negative."})
    class Meta:
        ordering = ['-id']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

class WorkoutScheduleStatus(IntEnum):
    SCHEDULED = 0
    COMPLETED = 1
    CANCELLED = 2
    PENDING_CHANGE = 3
    CHANGED = 4

    @classmethod
    def choices(cls):
        return [(status.value, status.name.capitalize()) for status in cls]


class TrainingType(IntEnum):
    SELF_TRAINING = 0
    PERSONAL_TRAINER = 1

    @classmethod
    def choices(cls):
        return [(t.value, t.name.replace("_", " ").capitalize()) for t in cls]


class WorkoutSchedule(BaseModel):
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="workout_schedules")
    training_type = models.IntegerField(choices=TrainingType.choices(), default=TrainingType.SELF_TRAINING.value)
    scheduled_at = models.DateTimeField(null=True)
    duration = models.IntegerField(null=True)
    status = models.IntegerField(choices=WorkoutScheduleStatus.choices(), default=WorkoutScheduleStatus.SCHEDULED.value)

    def __str__(self):
        return f"Workout session for {self.subscription.member.user.username} on {self.scheduled_at}"


class ChangeRequestStatus(IntEnum):
    PENDING = 0
    ACCEPTED = 1
    REJECTED = 2

    @classmethod
    def choices(cls):
        return [(status.value, status.name.capitalize()) for status in cls]


class WorkoutScheduleChangeRequest(BaseModel):
    schedule = models.ForeignKey(WorkoutSchedule, on_delete=models.CASCADE, related_name="change_requests")
    trainer = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, blank=True,related_name="change_requests")
    proposed_time = models.DateTimeField(null=False)
    reason = models.TextField(null=True, blank=True)
    status = models.IntegerField(choices=ChangeRequestStatus.choices(), default=ChangeRequestStatus.PENDING.value)

    def __str__(self):
        return f"Change request by {self.trainer.user.username} for {self.schedule.subscription.member.user.username}"


class Review(BaseModel):
    reviewer = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, related_name="members")
    training_package = models.ForeignKey(TrainingPackage, on_delete=models.CASCADE, related_name="reviews")
    parent_comment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name="replies")
    comment = models.TextField(null=True, blank=True)
    rating = models.IntegerField(null=False)  #1-5

    def clean(self):
        if self.rating <= 2 and not self.comment:
            raise ValidationError("A comment is required when the rating is 2 or lower.")

    def __str__(self):
        return f"Review by {self.reviewer.user.username} for {self.training_package.name}"

class Report(BaseModel):
    report_type = models.CharField(max_length=50, choices=[("REVENUE", "Doanh thu"), ("USAGE", "Sử dụng")])
    data = models.JSONField()
