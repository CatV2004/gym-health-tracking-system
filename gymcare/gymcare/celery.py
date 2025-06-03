import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymcare.settings')

celery_app = Celery('gymcare')

celery_app.config_from_object('django.conf:settings', namespace='CELERY')


# Celery Beat Setting
celery_app.autodiscover_tasks()


@celery_app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))


celery_app.conf.beat_schedule = {
    'delete-soft-deleted-records-every-day': {
        'task': 'gymcareapp.tasks.delete_permanently_after_30_days',
        'schedule': 5,
    },
    'send-workout-reminders': {
        'task': 'gymcareapp.tasks.send_workout_reminders',
        'schedule': 300,  # 5 * 60
    },
    'send-subscription-expiry-reminders': {
        'task': 'gymcareapp.tasks.send_subscription_expiry_reminders',
        'schedule': 86400.0,  # 24 giờ
    },
    'update-schedule-status-hourly': {
        'task': 'gymcareapp.tasks.update_workout_schedule_status',
        'schedule': crontab(minute=0),  # Chạy mỗi giờ
    },
    'update-subscription-status-daily': {
        'task': 'gymcareapp.tasks.update_subscription_status',
        'schedule': crontab(minute=0, hour=0),  # Chạy mỗi ngày lúc 00:00
    },
    # 'weekly-predictions': {
    #     'task': 'progress_tracker.tasks.generate_member_predictions',
    #     'schedule': 30.0,  # mỗi 60 giây
    # },
    # 'monthly-model-retrain': {
    #     'task': 'progress_tracker.tasks.train_global_model',
    #     'schedule': 60.0,  # mỗi 60 giây
    # },
}

celery_app.conf.broker_connection_retry_on_startup = True