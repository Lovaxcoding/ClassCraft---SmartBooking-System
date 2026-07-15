from rest_framework import serializers
from .models import ActiviteLog, Utilisateur, Resource, Equipement, Reservation

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
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
    utilisateur_details = serializers.SerializerMethodField(read_only=True)
    ressource_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 
            'date', 
            'heure_debut', 
            'heure_fin', 
            'utilisateur', 
            'ressource', 
            'equipements_optionnels', 
            'statut', 
            'utilisateur_details', 
            'ressource_details'
        ]

    def get_utilisateur_details(self, obj):
        if obj.utilisateur:
            return {
                "id": obj.utilisateur.id,
                "first_name": obj.utilisateur.first_name,
                "last_name": obj.utilisateur.last_name,
                "email": obj.utilisateur.email,
            }
        return None

    def get_ressource_details(self, obj):
        if obj.ressource:
            return {
                "id": obj.ressource.id,
                "nom": obj.ressource.nom,
                "type": obj.ressource.type,
            }
        return None

class ActiviteLogSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.SerializerMethodField()

    class Meta:
        model = ActiviteLog
        fields = ['id', 'timestamp', 'utilisateur', 'utilisateur_nom', 'action', 'details', 'severite']

    def get_utilisateur_nom(self, obj):
        if obj.utilisateur:
            return f"{obj.utilisateur.first_name} {obj.utilisateur.last_name}".strip() or obj.utilisateur.username
        return "Système"