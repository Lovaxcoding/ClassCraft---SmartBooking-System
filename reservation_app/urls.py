from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from reservation_app.views import (
    UtilisateurViewSet, ResourceViewSet, 
    EquipementViewSet, ReservationViewSet
)

# Le routeur de DRF génère automatiquement toutes les routes CRUD usuelles (GET, POST, etc.)
router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'ressources', ResourceViewSet)
router.register(r'equipements', EquipementViewSet)
router.register(r'reservations', ReservationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # Toutes nos routes seront sous http://localhost:8000/api/...
]