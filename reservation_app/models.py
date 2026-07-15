from django.db import models
from django.contrib.auth.models import AbstractUser
 
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

    # On configure l'email comme identifiant principal au lieu du username si désiré
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
    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='reservations')
    ressource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='reservations')
    equipements_optionnels = models.ManyToManyField(Equipement, blank=True)

    def __str__(self):
        return f"Réservation {self.ressource.nom} par {self.utilisateur.nom} le {self.date}"