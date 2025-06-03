"""
ASGI config for gymcare project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import path
from gymcareapp.consumers import NotificationConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymcare.settings')

application = get_asgi_application()
# django_asgi_app = get_asgi_application()
#
# application = ProtocolTypeRouter({
#     # HTTP requests vẫn sử dụng Django ASGI app thông thường
#     "http": django_asgi_app,
#
#     # WebSocket requests sẽ được xử lý bởi Channels
#     "websocket": AllowedHostsOriginValidator(
#         AuthMiddlewareStack(
#             URLRouter([
#                 path("ws/notifications/", NotificationConsumer.as_asgi()),
#                 # Thêm các WebSocket routes khác nếu cần
#             ])
#         )
#     ),
# })