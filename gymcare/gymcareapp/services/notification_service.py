from django.contrib.contenttypes.models import ContentType
from ..models import Notification


def send_notification(user, message, notification_type, related_object=None):
    if not user.is_active:
        logger.warning(f"Cannot send notification to inactive user {user.id}")
        return None

    try:
        notification = Notification.objects.create(
            user=user,
            message=message,
            notification_type=notification_type
        )

        if related_object:
            notification.related_object_id = related_object.id
            notification.related_content_type = ContentType.objects.get_for_model(related_object)
            notification.save()

        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}",
                {
                    "type": "send_notification",
                    "content": {
                        "id": notification.id,
                        "message": message,
                        "type": notification_type,
                        "is_read": False,
                        "sent_at": notification.sent_at.isoformat(),
                        "related_object": str(related_object) if related_object else None,
                        "action_url": get_action_url(notification)
                    }
                }
            )
        except Exception as e:
            logger.error(f"WebSocket error for user {user.id}: {str(e)}")

        return notification
    except Exception as e:
        logger.error(f"Failed to create notification: {str(e)}")
        return None