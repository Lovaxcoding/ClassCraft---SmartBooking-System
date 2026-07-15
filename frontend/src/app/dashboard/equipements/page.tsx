"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Equipement } from "@/types/reservation";
import { 
  Wrench, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sliders
} from "lucide-react";

export default function EquipementsPage() {
  // États pour les données de l'API Django
  const [equipments, setEquipments] = useState<Equipement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  
  // États du formulaire (Mode création ou édition)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEquipmentId, setCurrentEquipmentId] = useState<number | null>(null);
  const [nom, setNom] = useState<string>("");
  const [quantiteDisponible, setQuantiteDisponible] = useState<number>(1);

  // États de retour notifications
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 1. Récupérer la liste des équipements
  const fetchEquipments = async () => {
    try {
      const response = await api.get<Equipement[]>("equipements/");
      setEquipments(response.data);
    } catch (err) {
      setErrorMessage("Impossible de charger la liste des équipements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
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

  // Réinitialiser le formulaire
  const resetForm = () => {
    setIsEditing(false);
    setCurrentEquipmentId(null);
    setNom("");
    setQuantiteDisponible(1);
  };

  // 2. Soumission : Création ou Modification (C / U du CRUD)
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = { 
      nom, 
      quantite_disponible: quantiteDisponible 
    };

    try {
      if (isEditing && currentEquipmentId) {
        await api.put(`equipements/${currentEquipmentId}/`, payload);
        setSuccessMessage("Équipement mis à jour avec succès !");
      } else {
        await api.post("equipements/", payload);
        setSuccessMessage("Nouvel équipement ajouté au stock !");
      }
      resetForm();
      fetchEquipments();
    } catch (err: any) {
      setErrorMessage("Une erreur est survenue lors de la communication avec Django.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Préparer l'édition
  const handleEditClick = (equip: Equipement) => {
    setIsEditing(true);
    setCurrentEquipmentId(equip.id);
    setNom(equip.nom);
    setQuantiteDisponible(equip.quantite_disponible);
  };

  // 4. Suppression (D du CRUD)
  const handleDeleteEquipment = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet équipement ? Cela le retirera des choix de réservations.")) return;

    try {
      await api.delete(`equipements/${id}/`);
      setSuccessMessage("Équipement retiré de la base SQLite.");
      fetchEquipments();
    } catch (err) {
      setErrorMessage("Erreur lors de la suppression. L'élément est probablement associé à un historique.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Chargement du stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête de la section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="h-6 w-6 text-blue-600" /> Matériels & Accessoires Optionnels
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Gérez le stock de fournitures additionnelles demandées en complément des salles.
        </p>
      </div>

      {/* Messages d'alerte */}
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

      {/* Interface principale en Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORMULAIRE GAUCHE */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
            <PlusCircle className="h-5 w-5 text-blue-500" />
            {isEditing ? "Modifier l'équipement" : "Ajouter au stock"}
          </h2>
          <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
            Déclarez la quantité d'accessoires disponibles à l'accueil.
          </p>

          <form onSubmit={handleSaveEquipment} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de l'accessoire</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex: Pointeur Laser, Rallonge 5m"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantité totale en stock</label>
              <input
                type="number"
                required
                min={0}
                value={quantiteDisponible}
                onChange={(e) => setQuantiteDisponible(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {submitLoading ? "Envoi..." : isEditing ? "Mettre à jour" : "Ajouter"}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTE DROITE */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">Inventaire du stock physique</h2>
          <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
            Suivi des volumes globaux déclarés pour l'établissement.
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Nom de l'accessoire</th>
                  <th className="px-4 py-3">Quantité Globale</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                {equipments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-slate-400 dark:text-slate-500">
                      Aucun équipement optionnel en stock.
                    </td>
                  </tr>
                ) : (
                  equipments.map((equip) => (
                    <tr key={equip.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-slate-400" />
                          {equip.nom}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                          equip.quantite_disponible > 0 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" 
                            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}>
                          {equip.quantite_disponible} unités
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(equip)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-blue-400 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(equip.id)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
}