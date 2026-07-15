"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Reservation } from "@/types/reservation";
import { 
  CalendarDays, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  User,
  Layers,
  Clock,
  Calendar,
  Search
} from "lucide-react";

export default function ReservationsGlobalPage() {
  // États pour les données
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // États pour le filtrage local
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  // États de retour notifications
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 1. Récupérer l'intégralité des réservations depuis Django
  const fetchAllReservations = async () => {
    try {
      const response = await api.get<Reservation[]>("reservations/");
      setReservations(response.data);
    } catch (err) {
      setErrorMessage("Impossible de charger le registre des réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReservations();
  }, []);

  // Nettoyage automatique des messages flash
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // 2. Annuler une réservation (D du CRUD)
  const handleCancelReservation = async (id: number) => {
    if (!confirm("Voulez-vous vraiment annuler cette réservation ? Les ressources et équipements associés seront immédiatement libérés.")) return;

    try {
      await api.delete(`reservations/${id}/`);
      setSuccessMessage("La réservation a été annulée avec succès. Un e-mail de libération a été envoyé.");
      fetchAllReservations(); // Recharger le flux synchrone
    } catch (err) {
      setErrorMessage("Erreur lors de l'annulation de la réservation.");
    }
  };

  // 3. Logique de filtrage (Recherche par nom d'élève ou par ressource + filtre date)
  const filteredReservations = reservations.filter((res) => {
    const studentName = res.utilisateur_details 
      ? `${res.utilisateur_details.first_name} ${res.utilisateur_details.last_name}`.toLowerCase()
      : "";
    const resourceName = res.ressource_details?.nom.toLowerCase() || "";
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || resourceName.includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? res.date === filterDate : true;

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Chargement du registre global...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-blue-600" /> Registre Central des Réservations
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Consultez l'historique complet, recherchez un créneau spécifique ou révoquez une allocation de salle.
        </p>
      </div>

      {/* Messages Flash */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* BARRE DE RECHERCHE ET FILTRES D'INVENTAIRE */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950">
        
        {/* Recherche textuelle */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Rechercher par élève ou par salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Recherche par date exacte */}
        <div className="relative w-full sm:w-48">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Bouton pour réinitialiser les filtres */}
        {(searchTerm || filterDate) && (
          <button
            onClick={() => { setSearchTerm(""); setFilterDate(""); }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      {/* TABLEAU CENTRAL */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Ressource Allouée</th>
                <th className="px-4 py-3">Bénéficiaire (Élève)</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Plage Horaire</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune réservation ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    
                    {/* Ressource avec son tag visuel */}
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-slate-400" />
                        <div className="flex flex-col">
                          <span>{res.ressource_details?.nom || `Ressource #${res.ressource}`}</span>
                          {res.equipements_optionnels && res.equipements_optionnels.length > 0 && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                              +{res.equipements_optionnels.length} accessoire(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Étudiant demandeur */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        {res.utilisateur_details 
                          ? `${res.utilisateur_details.first_name} ${res.utilisateur_details.last_name}`
                          : `Utilisateur #${res.utilisateur}`
                        }
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {res.date}
                      </div>
                    </td>

                    {/* Horaires formattés */}
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        {res.heure_debut.substring(0, 5)} - {res.heure_fin.substring(0, 5)}
                      </div>
                    </td>

                    {/* Révocation / Annulation */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCancelReservation(res.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60 transition-colors"
                          title="Annuler cette réservation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Annuler</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}