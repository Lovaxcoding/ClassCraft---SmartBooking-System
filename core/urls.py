from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import (
    SpectacularAPIView, 
    SpectacularRedocView, 
    SpectacularSwaggerView
)
from reservation_app.views import (
    ActiviteLogViewSet, UtilisateurViewSet, ResourceViewSet, 
    EquipementViewSet, ReservationViewSet, CustomAuthToken
)

# Configuration du routeur pour les entités de l'application
router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'ressources', ResourceViewSet)
router.register(r'equipements', EquipementViewSet)
router.register(r'reservations', ReservationViewSet)
router.register(r'logs', ActiviteLogViewSet)

urlpatterns = [
    # Interface d'administration Django
    path('admin/', admin.site.urls),

    # 1. Endpoint d'authentification par Token pour le Frontend (React/Next.js)
    # Permet de POSTER {username, password} et de recevoir le Token + infos utilisateur
    path('api/api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),

    # 2. Toutes les routes générées automatiquement pour le CRUD (utilisateurs, ressources, etc.)
    path('api/', include(router.urls)), 

    # 3. Documentation interactive de l'API (gérée par drf-spectacular)
    # Récupération du schéma de configuration de l'API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Documentation visuelle Swagger (très pratique pour tester en direct)
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Documentation alternative Redoc
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]