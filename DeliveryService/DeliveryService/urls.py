"""
URL configuration for DeliveryService project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.utils.timezone import now
import django


@require_GET
def health(_request):
    return JsonResponse({
        "status": "ok",
        "service": "DeliveryService",
        "django": django.get_version(),
        "time": now().isoformat(),
    })


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/health/', health, name='api-health'),
    path('api/health', health),  # alias (no trailing slash)
    path('health/', health, name='health'),
    path('health', health),      # alias (no trailing slash)

    path('api/', include('core.api.urls')),

    # Frontend (templates) -> includes favorites/favoris via core.web.urls
    path('', include('core.web.urls')),
]
