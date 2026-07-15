# Rapport de fonctionnalité et améliorations suggérées

## 1. Vue d’ensemble du projet

ClassCraft est une application de gestion de réservations et de ressources destinée à des établissements scolaires ou organisations. Elle combine :
- un backend Django REST Framework pour la logique métier, la persistance et l’API ;
- un frontend Next.js avec une interface moderne pour la réservation, la gestion des ressources et l’administration.

L’objectif principal est de permettre la réservation de salles, matériels et équipements tout en limitant les conflits d’horaire et en centralisant l’information.

---

## 2. Fonctionnalités actuellement présentes

### 2.1 Backend Django / API

Le backend propose actuellement les éléments suivants :
- Modèles principaux :
  - Utilisateur (hérite de AbstractUser)
  - Resource
  - Equipement
  - Reservation
  - ActiviteLog
- API REST via Django REST Framework :
  - gestion des utilisateurs
  - gestion des ressources
  - gestion des équipements
  - gestion des réservations
  - consultation des logs d’activité
- Authentification par token personnalisée.
- Logique métier de réservation :
  - validation de la durée minimale et maximale
  - détection des conflits sur la ressource principale
  - validation de la disponibilité des équipements optionnels
  - génération de propositions alternatives si le créneau est occupé
- Envoi d’email de confirmation après réservation.
- Journalisation des événements système (création, conflit, échec, etc.).

### 2.2 Frontend Next.js

Le frontend expose une interface utilisateur structurée autour de plusieurs vues :
- page de connexion
- tableau de bord de création de réservation
- registre global des réservations
- gestion des ressources (CRUD)
- gestion des utilisateurs (CRUD)
- pages de statistiques
- page de logs d’activité
- navigation avec sidebar et navbar
- thème sombre/clair

### 2.3 Expérience utilisateur actuelle

Le front offre un rendu visuellement soigné avec :
- formulaires modernes
- messages de succès/erreur
- chargement et états vides
- filtres de recherche sur les réservations
- interface responsive

---

## 3. Points forts du projet

### 3.1 Bonne séparation entre backend et frontend
Le projet montre une architecture relativement claire :
- le backend gère les règles métier,
- le frontend consomme l’API via un client Axios dédié.

### 3.2 Logique de réservation déjà robuste
La logique de conflit est bien pensée :
- les réservations sur une même ressource sont bloquées en cas de chevauchement,
- les équipements sont aussi contrôlés,
- des alternatives sont proposées automatiquement.

### 3.3 Interface moderne et agréable
L’UI est bien présentée, avec une expérience cohérente sur les pages principales.

---

## 4. Problèmes et limites observées

### 4.1 Problèmes fonctionnels potentiels
- L’authentification côté frontend semble appeler une route non alignée avec le backend. Le frontend poste vers une URL de type “login/”, alors que le backend expose une route d’authentification token différente.
- L’API base URL est codée en dur dans le frontend, ce qui limite la portabilité et le déploiement.
- Les erreurs réseau et API ne sont pas toujours uniformisées côté interface.

### 4.2 Points d’amélioration backend
- La logique métier est encore fortement intégrée dans la vue, ce qui rend le code plus difficile à maintenir.
- Les permissions et rôles ne semblent pas encore totalement exploités selon un modèle fin et sécurisé.
- La validation des données pourrait être déplacée dans des serializers ou services dédiés.
- Les emails de confirmation dépendent d’une configuration SMTP non explicitement sécurisée ou centralisée.
- Le système de logs est utile, mais pourrait être enrichi avec plus de métadonnées et d’actions structurées.

### 4.3 Points d’amélioration frontend
- Les différentes vues sont bien présentes, mais certaines parties restent centrées sur une logique “admin” plutôt que sur une vraie expérience métier complète.
- L’interface pourrait gagner en cohérence sur les formulaires d’édition et la gestion des erreurs.
- L’absence de pagination et de filtres avancés devient un frein si le volume de données augmente.
- La gestion des réservations pourrait être améliorée avec un vrai calendrier visuel et une vue par jour/semaine.
- Le système n’intègre pas encore pleinement les rôles utilisateur dans l’UI (ex. accès différencié admin / réception / délégué).

---

## 5. Recommandations prioritaires

### Priorité haute
1. Corriger l’intégration de l’authentification entre frontend et backend.
2. Externaliser la configuration API et les variables d’environnement.
3. Ajouter des tests unitaires et d’intégration sur les fonctionnalités critiques.
4. Sécuriser l’accès selon les rôles utilisateur.

### Priorité moyenne
5. Déplacer la logique métier hors des views vers des services ou use cases.
6. Ajouter la pagination, les filtres avancés et les tris sur les listes.
7. Introduire une vue calendrier et une gestion plus visuelle des disponibilités.
8. Améliorer les messages d’erreur et les retours utilisateur.

### Priorité basse / amélioration UX
9. Ajouter des indicateurs plus avancés (tendance d’occupation, taux d’utilisation, anomalies).
10. Ajouter une meilleure accessibilité (ARIA, focus, navigation clavier).
11. Préparer un déploiement propre avec Docker / reverse proxy / variables d’environnement prêtes pour la production.

---

## 6. Conclusion

Le projet est déjà fonctionnel sur plusieurs axes essentiels : authentification, création de réservations, gestion des ressources, consultation de logs et interface d’administration. Il montre une bonne base technique et une logique métier intéressante.

Le principal levier d’amélioration consiste à renforcer la robustesse technique, la sécurité, l’expérience utilisateur et la maintenabilité avant une évolution vers un produit plus complet et prêt pour la production.
