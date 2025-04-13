from pyexpat import model

from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from enum import IntEnum


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
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
    TRANER = 1
    MEMBER = 2

    @classmethod
    def choices(cls):
        return [(role.value, role.name.capitalize()) for role in cls]


class User(AbstractUser):
    avatar = CloudinaryField('avatar', null=False, blank=False, folder='gymcare',
                             default='https://res.cloudinary.com/dohsfqs6d/image/upload/v1742786537/gymcare/user.png')
    phone = models.CharField(max_length=10, unique=False, null=True)
    email = models.CharField(max_length=50, null=True)
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
    certification = models.TextField(null=True, blank=True)
    experience = models.IntegerField(default=0)
    def __str__(self):
        return f"PT: {self.user.username}"


class Member(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="member_profile")
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    goal = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Member: {self.user.username}"


class TypePackage(IntEnum):
    MONTH = 0
    QUARTER = 1
    YEAR = 2

    @classmethod
    def choices(cls):
        return [(package.value, package.name.capitalize()) for package in cls]


class TrainingPackage(BaseModel):
    name = models.CharField(max_length=128, null=False, unique=True)
    pt = models.ForeignKey("Trainer", on_delete=models.SET_NULL, null=True, blank=True, related_name="training_packages")
    type_package = models.IntegerField(choices=TypePackage.choices(), default=TypePackage.MONTH)
    start_date = models.DateField(null=False)
    end_date = models.DateField(null=False)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, null=False)

    def __str__(self):
        return f"{self.name} ({self.pt})"


class WorkoutProgress(BaseModel):
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=False)
    body_fat = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    muscle_mass = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Progress of {self.member.username} on {self.create_date.strftime('%Y-%m-%d')}"


class Subscription(BaseModel):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="subscriptions")
    training_package = models.ForeignKey(TrainingPackage, on_delete=models.CASCADE, related_name="subscriptions")

    def __str__(self):
        return f"Subscription of {self.member.user.username} for {self.training_package.name}"


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
    receipt_url = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Payment for {self.subscription.member.user.username} - {self.get_payment_status_display()}"


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
    SELF_TRAINING = 0  # Tự tập
    PERSONAL_TRAINER = 1  # Tập với PT

    @classmethod
    def choices(cls):
        return [(t.value, t.name.replace("_", " ").capitalize()) for t in cls]


class WorkoutSchedule(BaseModel):
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="workout_schedules")
    training_type = models.IntegerField(choices=TrainingType.choices(), default=TrainingType.SELF_TRAINING.value)
    scheduled_at = models.DateTimeField(null=False)
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

    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.training_package.name}"
