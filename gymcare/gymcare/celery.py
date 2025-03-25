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
}

celery_app.conf.broker_connection_retry_on_startup = True