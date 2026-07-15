# ClassCraft

Documentation d'installation et de configuration pour le backend (Django/Python) et le frontend (Node.js/React).

## Présentation
ClassCraft est une application de gestion de ressources et de réservations destinée aux établissements (salles, terrains, matériels, équipements informatiques).
Le backend expose une API REST (Django + DRF) for managing users, resources, equipment and reservations; the frontend (React/Vite) provides a UI to browse and create bookings.

## Problématique
Dans les organisations éducatives ou entreprises, la gestion manuelle des réservations entraîne des conflits d'horaires, des doublons et une mauvaise visibilité sur la disponibilité des équipements.
ClassCraft vise à:
- prévenir les collisions de réservation;
- proposer des alternatives quand une ressource est indisponible;
- centraliser l'inventaire des équipements et leur disponibilité.

## Utilisation
Après avoir démarré le backend et le frontend (voir sections ci-dessous), vous pouvez:
- créer des ressources et des équipements via l'admin Django ou l'API;
- créer des utilisateurs (ou utiliser `createsuperuser` pour l'administration);
- réserver une ressource pour une date/heure donnée via l'interface frontend ou l'endpoint API `/api/reservations/`.

Exemple minimal (appel API pour créer une réservation — adaptez les champs selon vos serializers):

```bash
curl -X POST http://localhost:8000/api/reservations/ \
	-H "Content-Type: application/json" \
	-d '{"date":"2026-07-20","heure_debut":"09:00:00","heure_fin":"11:00:00","utilisateur":1,"ressource":2}'
```

Pour le développement local, voir les commandes `python manage.py runserver` (backend) et `npm run dev` (frontend).

**Structure**
- backend: projet Django à la racine (géré par manage.py)
- frontend: dossier `frontend` (application JavaScript/Node)

**Prérequis**
- Python 3.10+ et pip
- Node.js 16+ et npm ou yarn
- Git

**Backend (Django)**
1. Créer un environnement virtuel et l'activer

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Installer les dépendances

```bash
pip install -r requirements.txt
```

(Si `requirements.txt` n'existe pas, installez Django et DRF par exemple: `pip install django djangorestframework`)

3. Variables d'environnement

- Créez un fichier `.env` à la racine ou configurez les variables d'environnement suivantes:

```
DJANGO_SECRET_KEY=changeme
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3  # ou une URL Postgres
```

4. Initialiser la base de données

```bash
python manage.py migrate
python manage.py makemigrations
```

5. Créer un superutilisateur (optionnel)

```bash
python manage.py createsuperuser
```

6. Lancer le serveur de développement

```bash
python manage.py runserver
```

7. Tests

```bash
python manage.py test
```

**Frontend**
1. Se placer dans le dossier frontend

```bash
cd frontend
```

2. Installer les dépendances

```bash
npm install
# ou
# yarn install
```

3. Variables d'environnement

- Créez un fichier `.env` dans `frontend/` si nécessaire (par ex. `VITE_API_URL` ou `REACT_APP_API_URL` selon le stack).

4. Lancer le serveur de développement

```bash
npm run dev
# ou
# npm start
```

5. Build de production

```bash
npm run build
```

**Conseils de déploiement**
- Pour Postgres, définissez `DATABASE_URL` et installez `psycopg2-binary`.
- Servez le frontend statique via un CDN ou serveur web (NGINX) et configurez le reverse-proxy vers le backend.

**Dépannage rapide**
- Vérifiez que l'environnement virtuel est activé.
- Supprimez les fichiers pyc et réessayez: `find . -name "*.pyc" -delete`.
- Vérifiez les logs d'erreur lors des migrations.

**Contacts**
- Mainteneur: (ajoutez votre nom et email)
