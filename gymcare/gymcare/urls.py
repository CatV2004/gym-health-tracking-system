import os

from django.urls import path, include, re_path
from drf_yasg import openapi
from rest_framework import permissions
from drf_yasg.views import get_schema_view

from gymcareapp.admin import my_admin_site

schema_view = get_schema_view(
    openapi.Info(
        title="App API",
        default_version="v1",
        description="APIs for App",
        contact=openapi.Contact(email=os.getenv('EMAIL_SEND')),
        license=openapi.License(name="GymCare App"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,)
)


urlpatterns = [
    path('', include('gymcareapp.urls')),
    path('admin/', my_admin_site.urls),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),

    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc')
]
