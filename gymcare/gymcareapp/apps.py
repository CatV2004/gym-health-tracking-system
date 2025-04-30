from django.apps import AppConfig


class GymcareappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gymcareapp'

    def ready(self):
        import gymcareapp.signals