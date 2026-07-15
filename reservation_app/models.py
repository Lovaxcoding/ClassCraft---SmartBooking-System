from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings  # <--- CORRIGÉ : Import standard de Django

class Utilisateur(AbstractUser):
    id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    ROLE_CHOICES = [
        ('ADMIN', 'Responsable Principal'),
        ('RECEPTION', 'Réceptionniste / Accueil'),
        ('DELEGUE', 'Élève Délégué / Responsable'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='DELEGUE')

    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']
    
    def get_role_display(self):
        return dict(self.ROLE_CHOICES).get(self.role, 'Inconnu')

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_role_display()})"


class Resource(models.Model):
    id = models.AutoField(primary_key=True)
    TYPE_CHOICES = [
        ('SALLE', 'Salle de classe / Terrain'),
        ('MATERIEL', 'Matériel / Équipement informatique'),
    ]
    nom = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"[{self.type}] {self.nom}"


class Equipement(models.Model):
    id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    quantite_disponible = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.nom} (Dispo: {self.quantite_disponible})"


class Reservation(models.Model):
    id = models.AutoField(primary_key=True)
    
    class StatutChoix(models.TextChoices):
        PRISE = 'PRISE', 'Prise / Confirmée'
        DISPONIBLE = 'DISPONIBLE', 'Disponible'
        EN_PAUSE = 'EN_PAUSE', 'En Pause / Maintenance'

    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="reservations"
    )
    # CORRIGÉ : Référence directe à la classe 'Resource' (sans s)
    ressource = models.ForeignKey(
        Resource, 
        on_delete=models.CASCADE, 
        related_name="reservations"
    )
    # CORRIGÉ : Référence directe à la classe 'Equipement'
    equipements_optionnels = models.ManyToManyField(
        Equipement, 
        blank=True
    )
    
    statut = models.CharField(
        max_length=15,
        choices=StatutChoix.choices,
        default=StatutChoix.PRISE,
    )

    def __str__(self):
        return f"Réservation {self.id} - {self.ressource.nom} ({self.date})"

class ActiviteLog(models.Model):
    class SeveriteChoix(models.TextChoices):
        INFO = 'INFO', 'Information'
        SUCCESS = 'SUCCESS', 'Succès'
        WARNING = 'WARNING', 'Avertissement / Conflit'
        ERROR = 'ERROR', 'Erreur Système'

    id = models.AutoField(primary_key=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(
        Utilisateur, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="logs"
    )
    action = models.CharField(max_length=255)  # Ex: "Création de réservation"
    details = models.TextField()               # Ex: "La salle B10 a été réservée pour le 18/07."
    severite = models.CharField(
        max_length=10, 
        choices=SeveriteChoix.choices, 
        default=SeveriteChoix.INFO
    )

    class Meta:
        ordering = ['-timestamp']  # Les plus récents en premier

    def __str__(self):
        return f"[{self.severite}] {self.action} - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"