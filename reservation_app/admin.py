from django.contrib import admin
from .models import Utilisateur, Resource, Equipement, Reservation

# On enregistre les modèles pour qu'ils apparaissent dans l'interface admin
admin.site.register(Utilisateur)
admin.site.register(Resource)
admin.site.register(Equipement)
admin.site.register(Reservation)