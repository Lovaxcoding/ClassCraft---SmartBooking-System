import { UserProfile } from './auth';

export type ResourceType = 'SALLE' | 'MATERIEL';

export interface Resource {
  id: number;
  nom: string;
  type: ResourceType;
  description?: string;
}

export interface Equipement {
  id: number;
  nom: string;
  quantite_disponible: number;
}

// Représente la structure requise pour envoyer une création au backend Django
export interface ReservationPayload {
  date: string;          // Format YYYY-MM-DD
  heure_debut: string;   // Format HH:MM
  heure_fin: string;     // Format HH:MM
  utilisateur: number;   // ID de l'utilisateur/élève
  ressource: number;     // ID de la ressource
  equipements_optionnels?: number[]; // IDs des équipements
}

// Représente une alternative proposée par l'algorithme de Django en cas de conflit
export interface AlternativeProposition {
  type: string;
  ressource_nom: string;
  ressource_id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
}

// Structure complète d'une réservation reçue de l'API (avec les détails inclus)
export interface Reservation {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  utilisateur: number;
  ressource: number;
  equipements_optionnels: number[];
  utilisateur_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  ressource_details?: Resource;
}

// Structure de la réponse renvoyée par le serveur Django
export interface ReservationResponse {
  status: 'success' | 'conflict';
  message: string;
  data?: Reservation;
  alternatives?: AlternativeProposition[];
}