from rest_framework import serializers
from .models import Utilisateur, Resource, Equipement, Reservation

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'role']
        extra_kwargs = {
            'password': {'write_only': True} # Le mot de passe ne sera jamais renvoyé en JSON pour la sécurité
        }

    def create(self, validated_data):
        # Utilisation de la méthode native de Django pour créer l'utilisateur et hasher le mot de passe
        user = Utilisateur.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'DELEGUE')
        )
        return user

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class EquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = '__all__'

class ReservationSerializer(serializers.ModelSerializer):
    # Permet d'afficher les détails complets des objets liés lors d'une lecture (GET)
    utilisateur_details = UtilisateurSerializer(source='utilisateur', read_only=True)
    ressource_details = ResourceSerializer(source='ressource', read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'date', 'heure_debut', 'heure_fin', 
            'utilisateur', 'ressource', 'equipements_optionnels',
            'utilisateur_details', 'ressource_details'
        ]