"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import { 
  Resource, 
  Equipement, 
  Reservation, 
  AlternativeProposition 
} from "@/types/reservation";
import { UserProfile } from "@/types/auth";
import { 
  CalendarPlus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Clock,
  User,
  Layers
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // États pour les listes de données de l'API
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [equipments, setEquipments] = useState<Equipement[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  
  // États pour le chargement général
  const [dataLoading, setDataLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // États du formulaire
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [reservationDate, setReservationDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [selectedEquipments, setSelectedEquipments] = useState<number[]>([]);

  // États de retour API (Succès / Conflits / Alternatives)
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [alternatives, setAlternatives] = useState<AlternativeProposition[]>([]);

  // 1. Chargement initial des données depuis Django
  const fetchData = async () => {
    try {
      const [resList, equipList, reserveList, userList] = await Promise.all([
        api.get<Resource[]>("ressources/"),
        api.get<Equipement[]>("equipements/"),
        api.get<Reservation[]>("reservations/"),
        api.get<UserProfile[]>("utilisateurs/")
      ]);

      setResources(resList.data);
      setEquipments(equipList.data);
      setReservations(reserveList.data);
      setStudents(userList.data.filter(u => u.role === "DELEGUE"));
    } catch (err) {
      setErrorMessage("Erreur lors de la récupération des données de l'API.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Gestion des sélections multiples d'équipements
  const handleEquipmentToggle = (id: number) => {
    setSelectedEquipments(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 2. Soumission du formulaire
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setAlternatives([]);

    // Validation de sécurité côté client
    if (!selectedStudent || selectedStudent === "") {
      setErrorMessage("Veuillez sélectionner un élève demandeur.");
      return;
    }
    if (!selectedResource || selectedResource === "") {
      setErrorMessage("Veuillez sélectionner une ressource.");
      return;
    }

    setSubmitLoading(true);

    const payload = {
      date: reservationDate,
      heure_debut: startTime,
      heure_fin: endTime,
      utilisateur: parseInt(selectedStudent, 10),
      ressource: parseInt(selectedResource, 10),
      equipements_optionnels: selectedEquipments
    };

    try {
      await api.post("reservations/", payload);
      setSuccessMessage("Réservation enregistrée avec succès !");
      
      // Réinitialisation complète et propre
      setSelectedStudent("");
      setSelectedResource("");
      setReservationDate("");
      setStartTime("");
      setEndTime("");
      setSelectedEquipments([]);
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setErrorMessage(err.response.data.message || "Conflit d'horaire détecté.");
        setAlternatives(err.response.data.alternatives || []);
      } else {
        setErrorMessage(err.response?.data?.utilisateur?.[0] || err.response?.data?.error || "Une erreur est survenue.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Application immédiate d'une alternative suggérée
  const handleApplyAlternative = (alt: AlternativeProposition) => {
    setReservationDate(alt.date);
    setStartTime(alt.heure_debut);
    setEndTime(alt.heure_fin);
    setSelectedResource(alt.ressource_id.toString());
    setAlternatives([]);
    setErrorMessage("");
    // Note : On ne nettoie PAS selectedStudent ici pour conserver l'élève en cours !
  };

  if (dataLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Chargement de ClassCraft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tableau de Bord Accueil</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Gérez et allouez les ressources de l'établissement sans conflits.</p>
      </div>

      {/* Notifications de retours */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ZONE 1 : FORMULAIRE NOUVELLE RÉSERVATION */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
              <CalendarPlus className="h-5 w-5 text-blue-500" /> Nouvelle Réservation
            </h2>
            <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">Saisissez la demande formulée à la réception.</p>
            
            <form onSubmit={handleCreateReservation} className="space-y-4">
              
{/* Choix de l'étudiant / délégué */}
<div>
  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Élève demandeur</label>
  <select
    required
    value={selectedStudent}
    onChange={(e) => setSelectedStudent(e.target.value)}
    className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
  >
    <option value="">-- Choisir un élève délégué --</option>
    {students.map((student) => (
      <option key={student.id} value={student.id.toString()}>
        {student.first_name} {student.last_name}
      </option>
    ))}
  </select>
</div>

              {/* Choix de la Ressource (Salle / Matériel) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ressource demandée</label>
                <select
                  required
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="" disabled={selectedResource !== ""}>Sélectionner une salle ou équipement...</option>
                  {resources.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.nom} ({res.type === "SALLE" ? "Salle/Terrain" : "Informatique"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date de réservation */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
                <input
                  type="date"
                  required
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Horaires (Début et Fin) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Heure début</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Heure fin</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Équipements optionnels additionnels */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Équipements optionnels additionnels
                </label>
                <div className="max-h-24 overflow-y-auto space-y-1 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  {equipments.map((equip) => (
                    <label key={equip.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEquipments.includes(equip.id)}
                        onChange={() => handleEquipmentToggle(equip.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{equip.nom} (Dispo: {equip.quantite_disponible})</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full mt-2 flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {submitLoading ? "Vérification..." : "Vérifier & Valider"}
              </button>
            </form>
          </div>

          {/* INTERCEPTION DU CONFLIT ET AFFICHAGE DES 3 ALTERNATIVES */}
          {errorMessage && (
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{errorMessage}</span>
                  {alternatives.length > 0 && <p className="mt-1">Voici 3 alternatives calculées par le système :</p>}
                </div>
              </div>

              {alternatives.length > 0 && (
                <div className="space-y-2">
                  {alternatives.map((alt, index) => (
                    <div
                      key={index}
                      onClick={() => handleApplyAlternative(alt)}
                      className="group p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-blue-950/40 cursor-pointer transition-all duration-150"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {alt.type}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 font-medium">
                          Appliquer →
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {alt.ressource_nom}
                      </p>
                      <div className="flex gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {alt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {alt.heure_debut} - {alt.heure_fin}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ZONE 2 : VUE D'ENSEMBLE / MONITORING DES RÉSERVATIONS */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">Flux des réservations validées</h2>
          <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">Liste en temps réel synchronisée avec la base SQLite.</p>
          
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Ressource</th>
                  <th className="px-4 py-3">Bénéficiaire (Élève)</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Horaires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 dark:text-slate-500">
                      Aucune réservation enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-slate-400" />
                          {res.ressource_details?.nom || `Ressource #${res.ressource}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          {res.utilisateur_details 
                            ? `${res.utilisateur_details.first_name} ${res.utilisateur_details.last_name}`
                            : `Utilisateur #${res.utilisateur}`
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{res.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400">
                        {res.heure_debut.substring(0, 5)} - {res.heure_fin.substring(0, 5)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}