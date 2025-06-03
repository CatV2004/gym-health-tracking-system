from django.db.models.signals import post_save
from django.dispatch import receiver
from firebase_admin.messaging import Message, Notification as FB_Notification
from .models import Promotion


@receiver(post_save, sender=Promotion)
def send_promotion_push_notification(sender, instance, created, **kwargs):
    if created or instance.is_active:
        from fcm_django.models import FCMDevice

        devices = FCMDevice.objects.all()  # Hoặc lọc theo user/device cụ thể

        message = Message(
            notification=FB_Notification(
                title="🎉 Khuyến mãi mới!",
                body=f"{instance.title} - {instance.description[:100]}...",
            ),
            data={
                "type": "promotion",
                "promotion_id": str(instance.id),
                "click_action": "FLUTTER_NOTIFICATION_CLICK"  # Key quan trọng cho mobile
            }
        )

        try:
            devices.send_message(message)
            print(f"✅ Đã gửi FCM cho {devices.count()} thiết bị")
        except Exception as e:
            print(f"❌ Lỗi gửi FCM: {str(e)}")