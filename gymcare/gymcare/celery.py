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
'remind_upcoming_workouts': {
        'task': 'gymcareapp.tasks.remind_upcoming_workouts',
        'schedule': 60.0 * 60,
    },
'remind_expiring_subscriptions': {
        'task': 'gymcareapp.tasks.remind_expiring_subscriptions',
        'schedule': 60.0 * 60 * 24,
    },
'notify_new_promotions': {
        'task': 'gymcareapp.tasks.notify_new_promotions',
        'schedule': 60.0 * 60 * 24 * 7,
    },
'update-schedule-status-hourly': {
        'task': 'gymcareapp.tasks.update_workout_schedule_status',
        'schedule': crontab(minute=0),  # Chạy mỗi giờ
    },
'update-subscription-status-daily': {
        'task': 'gymcareapp.tasks.update_subscription_status',
        'schedule': crontab(minute=0, hour=0),  # Chạy mỗi ngày lúc 00:00
    },

}

celery_app.conf.broker_connection_retry_on_startup = True