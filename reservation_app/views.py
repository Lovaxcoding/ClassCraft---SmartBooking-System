from rest_framework import viewsets, status
from rest_framework.response import Response
from django.core.mail import send_mail
from datetime import datetime, timedelta
from .models import Utilisateur, Resource, Equipement, Reservation
from .serializers import UtilisateurSerializer, ResourceSerializer, EquipementSerializer, ReservationSerializer

from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user'] # type: ignore
        token, created = Token.objects.get_or_create(user=user)
        
        # On renvoie le token ET les infos de profil de l'utilisateur (très utile pour React)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role
        })

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        
        # 1. Extraction et conversion des données
        date_obj = datetime.strptime(data['date'], '%Y-%m-%d').date()
        heure_debut = datetime.strptime(data['heure_debut'], '%H:%M').time()
        heure_fin = datetime.strptime(data['heure_fin'], '%H:%M').time()
        ressource_id = data['ressource']

        # 2. Règles de gestion de base (Durée)
        start_dt = datetime.combine(date_obj, heure_debut)
        end_dt = datetime.combine(date_obj, heure_fin)
        duree = end_dt - start_dt
        
        if end_dt <= start_dt:
            return Response({"error": "L'heure de fin doit être supérieure à l'heure de début."}, status=status.HTTP_400_BAD_REQUEST)
        
        if duree < timedelta(minutes=30):
            return Response({"error": "La durée minimale d'une réservation est de 30 minutes."}, status=status.HTTP_400_BAD_REQUEST)
            
        if duree > timedelta(hours=8):
            return Response({"error": "La durée d'une réservation ne peut pas dépasser 8 heures."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Détection des conflits
        conflits = Reservation.objects.filter(
            ressource_id=ressource_id,
            date=date_obj,
            heure_debut__lt=heure_fin,
            heure_fin__gt=heure_debut
        )

        if conflits.exists():
            # Génération de 3 propositions alternatives
            alternatives = self.generer_alternatives(date_obj, heure_debut, heure_fin, ressource_id)
            return Response({
                "status": "conflict",
                "message": "La ressource est occupée à ce créneau.",
                "alternatives": alternatives
            }, status=status.HTTP_409_CONFLICT)

        # 4. Traitement nominal (Pas de conflit)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        reservation = serializer.save()

        # 5. Envoi de l'e-mail de confirmation
        self.envoyer_email_confirmation(reservation)

        return Response({
            "status": "success",
            "message": "Réservation enregistrée avec succès et e-mail envoyé !",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    def generer_alternatives(self, date_obj, heure_debut, heure_fin, ressource_id):
        alternatives = []
        ressource_actuelle = Resource.objects.get(id=ressource_id)
        
        # Alternative 1 : Même ressource, mais plus tard
        nouveau_debut = (datetime.combine(date_obj, heure_fin) + timedelta(minutes=15)).time()
        nouveau_fin = (datetime.combine(date_obj, nouveau_debut) + timedelta(hours=2)).time()
        alternatives.append({
            "type": "Autre créneau",
            "ressource_nom": ressource_actuelle.nom,
            "ressource_id": ressource_actuelle.id,
            "date": str(date_obj),
            "heure_debut": nouveau_debut.strftime('%H:%M'),
            "heure_fin": nouveau_fin.strftime('%H:%M'),
        })

        # Alternative 2 & 3 : Ressources similaires libres au même moment
        ressources_similaires = Resource.objects.filter(type=ressource_actuelle.type).exclude(id=ressource_id)
        
        for res in ressources_similaires:
            if len(alternatives) >= 3:
                break
            
            libre = not Reservation.objects.filter(
                ressource=res,
                date=date_obj,
                heure_debut__lt=heure_fin,
                heure_fin__gt=heure_debut
            ).exists()
            
            if libre:
                alternatives.append({
                    "type": "Salle/Matériel similaire",
                    "ressource_nom": res.nom,
                    "ressource_id": res.id,
                    "date": str(date_obj),
                    "heure_debut": heure_debut.strftime('%H:%M'),
                    "heure_fin": heure_fin.strftime('%H:%M'),
                })

        # Sécurité : Compléter jusqu'à obtenir exactement 3 alternatives avec les jours suivants
        jours_suivants = 1
        while len(alternatives) < 3:
            autre_date = date_obj + timedelta(days=jours_suivants)
            alternatives.append({
                "type": "Autre date proche",
                "ressource_nom": ressource_actuelle.nom,
                "ressource_id": ressource_actuelle.id,
                "date": str(autre_date),
                "heure_debut": heure_debut.strftime('%H:%M'),
                "heure_fin": heure_fin.strftime('%H:%M'),
            })
            jours_suivants += 1

        return alternatives[:3]

    def envoyer_email_confirmation(self, reservation):
        # Utilisation de first_name et last_name mis à jour
        sujet = f"Confirmation de votre réservation - {reservation.ressource.nom}"
        message = (
            f"Bonjour {reservation.utilisateur.first_name},\n\n"
            f"La réservation demandée a bien été enregistrée par le responsable.\n"
            f"Détails :\n"
            f"- Ressource : {reservation.ressource.nom}\n"
            f"- Date : {reservation.date}\n"
            f"- Horaires : {reservation.heure_debut} - {reservation.heure_fin}\n\n"
            f"Merci d'utiliser notre plateforme !\nL'administration."
        )
        destinataire = [reservation.utilisateur.email]
        send_mail(sujet, message, 'admin@ispm.mg', destinataire, fail_silently=False)

# Viewsets standards pour les autres modèles
class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer

class EquipementViewSet(viewsets.ModelViewSet):
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer