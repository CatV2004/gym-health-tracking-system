from celery import shared_task
from django.core.mail import send_mail
import os
import logging
from django.utils import timezone
from datetime import timedelta
from django.apps import apps
from django.db import DatabaseError
from gymcareapp.models import BaseModel, SubscriptionStatus, WorkoutSchedule, Notification, NotificationType, \
    Subscription, WorkoutScheduleStatus
from gymcareapp.services.notification_service import send_notification
logger = logging.getLogger(__name__)


@shared_task
def delete_permanently_after_30_days():
    try:
        logger.info("✅ Task delete_permanently_after_30_days đang chạy..." + timezone.now())

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
def send_workout_reminders():
    logger.info("✅ Task send_workout_reminders đang chạy..." + timezone.now())
    now = timezone.now()
    one_hour_later = now + timedelta(hours=1)

    upcoming_sessions = WorkoutSchedule.objects.select_related(
        'subscription__member__user',
        'trainer__user'
    ).filter(
        scheduled_at__gte=now,
        scheduled_at__lte=one_hour_later,
        status=WorkoutScheduleStatus.SCHEDULED.value
    )

    for session in upcoming_sessions:
        user = session.subscription.member.user
        trainer_name = session.trainer.user.get_full_name() if session.trainer else "huấn luyện viên"
        avatar_url = session.trainer.user.avatar.url if session.trainer and session.trainer.user.avatar else None

        Notification.objects.create(
            user=user,
            message=f"Bạn có lịch tập với {trainer_name} lúc {session.scheduled_at.strftime('%H:%M %d/%m/%Y')}",
            notification_type=NotificationType.WORKOUT_REMINDER.value,
            related_object_id=session.id,
            related_content_type=ContentType.objects.get_for_model(session),
            image_url=avatar_url
        )

        if user.email:
            subject = f"Nhắc nhở lịch tập lúc {session.scheduled_at.strftime('%H:%M %d/%m/%Y')}"
            message = f"""
                        Xin chào {user.first_name},
                        
                        Bạn có lịch tập sắp diễn ra:
                        - Thời gian: {session.scheduled_at.strftime('%H:%M %d/%m/%Y')}
                        - Địa điểm: {session.location or 'Phòng tập chính'}
                        
                        Hãy chuẩn bị sẵn sàng cho buổi tập nhé!
                                    """

            send_email_async.delay(
                subject=subject,
                message=message.strip(),
                recipient_email=user.email
            )


@shared_task
def send_subscription_expiry_reminders():
    logger.info("✅ Task send_subscription_expiry_reminders đang chạy..." + timezone.now())
    now = timezone.now() + timedelta(hours=7)
    three_days_later = now + timedelta(days=3)

    expiring_subscriptions = Subscription.objects.select_related(
        'member__user',
        'plan'
    ).filter(
        end_date__gte=now.date(),
        end_date__lte=three_days_later.date(),
        status=SubscriptionStatus.ACTIVE.value
    )

    for subscription in expiring_subscriptions:
        user = subscription.member.user
        remaining_days = (subscription.end_date - now.date()).days
        plan_name = subscription.plan.name
        image_url = subscription.plan.image.url if subscription.plan.image else None

        Notification.objects.create(
            user=user,
            message=f"Gói tập {plan_name} sẽ hết hạn sau {remaining_days} ngày",
            notification_type=NotificationType.SUBSCRIPTION_EXPIRY.value,
            related_object_id=subscription.id,
            related_content_type=ContentType.objects.get_for_model(subscription),
            image_url=image_url
        )

        if user.email:
            subject = f"Thông báo gói tập sắp hết hạn ({remaining_days} ngày)"
            message = f"""
                        Xin chào {user.first_name},
                        
                        Gói tập của bạn sẽ hết hạn sau {remaining_days} ngày:
                        - Ngày hết hạn: {subscription.end_date.strftime('%d/%m/%Y')}
                        - Loại gói: {plan_name}
                        
                        Hãy gia hạn gói tập để tiếp tục sử dụng dịch vụ của chúng tôi!
                                    """

            send_email_async.delay(
                subject=subject,
                message=message.strip(),
                recipient_email=user.email
            )


@shared_task
def update_workout_schedule_status():
    logger.info("✅ Task update_workout_schedule_status đang chạy..." + timezone.now())
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
    logger.info("✅ Task update_subscription_status đang chạy..." + timezone.now())
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
    logger.info("✅ Task delete_cancelled_workouts đang chạy..." + timezone.now())
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