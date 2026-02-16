from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_realtime_notification(user_id, notification):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "send_notification",
            "notification": {
                "id": notification.id,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat(),
            },
        }
    )
