from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import User
from gymcareapp.configs.firebase_config import db

@receiver(post_save, sender=User)
def sync_user_to_firebase(sender, instance, created, **kwargs):
    user_data = {
        'username': instance.username,
        'email': instance.email,
        'phone': instance.phone,
        'role': instance.role,
        'avatar_url': instance.avatar_url,
        'full_name': instance.get_full_name(),
    }
    # Push hoặc cập nhật vào Firestore
    db.collection('users').document(str(instance.id)).set(user_data)
    print(f'User {instance.username} synced to Firebase!')

@receiver(post_delete, sender=User)
def delete_user_from_firebase(sender, instance, **kwargs):
    db.collection('users').document(str(instance.id)).delete()
    print(f'User {instance.username} deleted from Firebase!')
