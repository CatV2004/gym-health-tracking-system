from celery import shared_task
from django.core.mail import send_mail
import os
import logging
from django.utils import timezone
from datetime import timedelta
from django.apps import apps
from django.db import DatabaseError

from gymcareapp.models import BaseModel


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
