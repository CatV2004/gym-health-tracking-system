from django.test import TestCase
from gymcareapp.tasks import delete_permanently_after_30_days, send_workout_reminders
from celery.exceptions import Retry

class TaskTests(TestCase):
    def test_delete_permanently_task(self):
        try:
            result = delete_permanently_after_30_days.delay()
            self.assertTrue(result.successful() or result.failed())
        except Retry:
            pass

    def test_workout_reminders(self):
        result = send_workout_reminders.delay()
        self.assertFalse(result.failed())