from celery import shared_task
from django.core.mail import send_mail
import os
import logging


# @shared_task
# def delete_permanently_after_30_days():
#     try:
#         celery_logger.info("Starting task: delete_permanently_after_30_days")
#
#         all_models = apps.get_models()
#         thirty_days_ago = timezone.now() - timedelta(days=30)  # 30 days ago timestamp
#
#         for model in all_models:
#             if issubclass(model, BaseModel) and not model._meta.abstract:
#                 records_to_delete = model.objects.filter(
#                     deleted_date__lte=thirty_days_ago,
#                     active=False
#                 )
#
#                 record_count = records_to_delete.count()
#
#                 if record_count > 0:
#                     records_to_delete.delete()
#                     celery_logger.info(
#                         f"Deleted {record_count} expired records from model {model.__name__}."
#                     )
#                 else:
#                     celery_logger.info(
#                         f"No records to delete in model {model.__name__}."
#                     )
#
#     except DatabaseError as db_err:
#         celery_logger.error(f"Database error during deletion: {str(db_err)}")
#
#     except Exception as generic_error:
#         celery_logger.error(f"An unexpected error occurred: {str(generic_error)}")
#
#     celery_logger.info("Task completed: delete_permanently_after_30_days")


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
        celery_logger.info(f"Email sent to {recipient_email}")
    except Exception as e:
        celery_logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
