from channels.generic.websocket import AsyncJsonWebsocketConsumer

class NotificationConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        user = self.scope["user"]

        if user.is_anonymous:
            await self.close()
        else:
            self.group_name = f"user_{user.id}"

            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )

            await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def send_notification(self, event):
        await self.send_json(event["notification"])
