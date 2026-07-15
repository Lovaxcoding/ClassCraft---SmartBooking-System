from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from reservation_app.views import (
    UtilisateurViewSet, ResourceViewSet, 
    EquipementViewSet, ReservationViewSet,
    CustomAuthToken  # <--- Ajouté ici
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'ressources', ResourceViewSet)
router.register(r'equipements', EquipementViewSet)
router.register(r'reservations', ReservationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # Route sécurisée mise à jour pour utiliser notre logique personnalisée (POO)
    path('api/login/', CustomAuthToken.as_view(), name='api_token_auth'),
    
    # Documentation interactive style Scalar/Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]