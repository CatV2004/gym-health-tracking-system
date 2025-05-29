from celery import shared_task
from django.core.mail import send_mail
import os
import logging
from django.utils import timezone
from datetime import timedelta
from django.apps import apps
from django.db import DatabaseError

from gymcareapp.models import BaseModel, SubscriptionStatus, WorkoutSchedule, Notification, WorkoutScheduleStatus

logger = logging.getLogger(__name__)


@shared_task
def delete_permanently_after_30_days():
    try:
        celery_logger.info("Starting task: delete_permanently_after_30_days")

        all_models = apps.get_models()
        thirty_days_ago = timezone.now() - timedelta(days=30)  # 30 days ago timestamp

        for model in all_models:
            if issubclass(model, BaseModel) and not model._meta.abstract:
                records_to_delete = model.objects.filter(
                    deleted_date__lte=thirty_days_ago,
                    active=False
                )

                record_count = records_to_delete.count()

                if record_count > 0:
                    records_to_delete.delete()
                    celery_logger.info(
                        f"Deleted {record_count} expired records from model {model.__name__}."
                    )
                else:
                    celery_logger.info(
                        f"No records to delete in model {model.__name__}."
                    )

    except DatabaseError as db_err:
        celery_logger.error(f"Database error during deletion: {str(db_err)}")

    except Exception as generic_error:
        celery_logger.error(f"An unexpected error occurred: {str(generic_error)}")

    celery_logger.info("Task completed: delete_permanently_after_30_days")


celery_logger = logging.getLogger("celery")
celery_logger.setLevel(logging.INFO)
@shared_task
def send_email_async(subject, message, recipient_email):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=os.getenv('EMAIL_SEND'),
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        print(f"Email sent to {recipient_email}")
    except Exception as e:
        print(f"Failed to send email to {recipient_email}: {str(e)}")


@shared_task
def notify_upcoming_workouts():
    now = timezone.now()
    start_time = now + timedelta(minutes=30)
    end_time = now + timedelta(minutes=45)

    schedules = WorkoutSchedule.objects.filter(
        scheduled_at__range=(start_time, end_time),
        status=0,
        active=True
    )

    for schedule in schedules:
        user = schedule.subscription.member.user
        message = f"Bạn có buổi tập lúc {schedule.scheduled_at.strftime('%H:%M %d/%m/%Y')}."
        Notification.objects.create(user=user, message=message)
        send_mail(
            "Nhắc nhở buổi tập",
            message,
            os.getenv("EMAIL_SEND"),
            [user.email],
            fail_silently=True,
        )

@shared_task
def notify_expiring_subscriptions():
    today = timezone.now().date()
    target = today + timedelta(days=3)
    subs = Subscription.objects.filter(
        end_date__range=(today, target),
        status=SubscriptionStatus.ACTIVE,
    )
    for sub in subs:
        user = sub.member.user
        message = f"Gói tập của bạn sẽ hết hạn vào ngày {sub.end_date.strftime('%d/%m/%Y')}."
        Notification.objects.create(user=user, message=message)
        send_mail(
            "Gói tập sắp hết hạn",
            message,
            os.getenv("EMAIL_SEND"),
            [user.email],
            fail_silently=True,
        )

@shared_task
def expire_ended_subscriptions():
    today = timezone.now().date()
    expired = Subscription.objects.filter(
        end_date__lt=today,
        status=SubscriptionStatus.ACTIVE,
    )
    for sub in expired:
        sub.status = SubscriptionStatus.EXPIRED
        sub.save()
        Notification.objects.create(
            user=sub.member.user,
            message="Gói tập của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục tập luyện.",
        )


@shared_task
def update_workout_schedule_status():
    try:
        now = timezone.now()
        buffer_time = now - timedelta(hours=1)

        schedules_to_complete = WorkoutSchedule.objects.filter(
            scheduled_at__lte=buffer_time,
            status__in=[
                WorkoutScheduleStatus.SCHEDULED.value,
                WorkoutScheduleStatus.APPROVED.value
            ]
        )

        count = 0
        for schedule in schedules_to_complete:
            with transaction.atomic():
                schedule.status = WorkoutScheduleStatus.COMPLETED.value
                schedule.save()
                count += 1

        logger.info(f"Đã cập nhật {count} buổi tập thành COMPLETED")
        return f"Updated {count} schedules to COMPLETED"

    except Exception as e:
        logger.error(f"Lỗi khi cập nhật trạng thái buổi tập: {str(e)}")
        raise


@shared_task
def update_subscription_status():
    try:
        now = timezone.now().date()
        expired_subs = Subscription.objects.filter(
            end_date__lt=now,
            status=SubscriptionStatus.ACTIVE.value
        )

        count = 0
        for sub in expired_subs:
            with transaction.atomic():
                sub.status = SubscriptionStatus.EXPIRED.value
                sub.save()
                count += 1

        logger.info(f"Đã cập nhật {count} gói tập thành EXPIRED")
        return f"Updated {count} subscriptions to EXPIRED"

    except Exception as e:
        logger.error(f"Lỗi khi cập nhật trạng thái gói tập: {str(e)}")
        raise


# Tự động xóa các lịch tập đã hủy trước đây 30 ngày
@shared_task
def delete_cancelled_workouts():
    try:

        thirty_days_ago = timezone.now() - timedelta(days=30)

        cancelled_workouts = WorkoutSchedule.objects.filter(
            status=WorkoutScheduleStatus.CANCELLED.value,
            updated_date__lte=thirty_days_ago,
            active=True
        )

        count = cancelled_workouts.count()

        if count > 0:
            deleted_count, _ = cancelled_workouts.delete() #bulk delete
            logger.info(f"Đã xóa {deleted_count} lịch tập đã hủy")
            return deleted_count
        else:
            logger.info("Không có lịch tập đã hủy nào cần xóa")
            return 0

    except Exception as e:
        logger.error(f"Lỗi khi xóa lịch tập đã hủy: {str(e)}")
        raise