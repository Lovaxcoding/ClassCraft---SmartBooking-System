"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Resource, ResourceType } from "@/types/reservation";
import { 
  Layers, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Home,
  Laptop
} from "lucide-react";

export default function RessourcesPage() {
  // États pour les données de l'API Django
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  
  // États du formulaire (Mode création ou édition)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentResourceId, setCurrentResourceId] = useState<number | null>(null);
  const [nom, setNom] = useState<string>("");
  const [type, setType] = useState<ResourceType>("SALLE");
  const [description, setDescription] = useState<string>("");

  // États de retour notifications
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 1. Récupérer la liste des ressources
  const fetchResources = async () => {
    try {
      const response = await api.get<Resource[]>("ressources/");
      setResources(response.data);
    } catch (err) {
      setErrorMessage("Impossible de charger la liste des ressources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
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
    setCurrentResourceId(null);
    setNom("");
    setType("SALLE");
    setDescription("");
  };

  // 2. Soumission : Création ou Modification (C / U)
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = { nom, type, description };

    try {
      if (isEditing && currentResourceId) {
        await api.put(`ressources/${currentResourceId}/`, payload);
        setSuccessMessage("Ressource modifiée avec succès !");
      } else {
        await api.post("ressources/", payload);
        setSuccessMessage("Nouvelle ressource ajoutée au catalogue !");
      }
      resetForm();
      fetchResources();
    } catch (err: any) {
      setErrorMessage("Une erreur est survenue lors de la communication avec Django.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Préparer l'édition
  const handleEditClick = (res: Resource) => {
    setIsEditing(true);
    setCurrentResourceId(res.id);
    setNom(res.nom);
    setType(res.type);
    setDescription(res.description || "");
  };

  // 4. Suppression (D)
  const handleDeleteResource = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette ressource ? Cela annulera les réservations associées.")) return;

    try {
      await api.delete(`ressources/${id}/`);
      setSuccessMessage("Ressource retirée de la base SQLite.");
      fetchResources();
    } catch (err) {
      setErrorMessage("Erreur lors de la suppression. La ressource est peut-être liée à une réservation en cours.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Chargement des ressources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête de section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="h-6 w-6 text-blue-600" /> Salles & Matériels Principaux
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Configurez les locaux et le matériel informatique majeurs mis à disposition pour les réservations.
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

      {/* Interface principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORMULAIRE GAUCHE */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
            <FolderPlus className="h-5 w-5 text-blue-500" />
            {isEditing ? "Modifier l'élément" : "Ajouter une ressource"}
          </h2>
          <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
            Enregistrez les infrastructures physiques ou équipements lourds.
          </p>

          <form onSubmit={handleSaveResource} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de la ressource</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex: Amphi B, Labo Info 1"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catégorie</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="SALLE">Salle / Amphi / Terrain</option>
                <option value="MATERIEL">Matériel d'importance (Vidéoprojecteur...)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description / Renseignements</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: Capacité 50 places, équipé de climatisation..."
                rows={3}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {submitLoading ? "Envoi..." : isEditing ? "Sauvegarder" : "Ajouter"}
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
          <h2 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">Inventaire des ressources</h2>
          <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
            Liste complète disponible pour l'algorithme anti-conflit.
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 dark:text-slate-500">
                      Aucune ressource enregistrée.
                    </td>
                  </tr>
                ) : (
                  resources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {res.nom}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                          res.type === "SALLE" 
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" 
                            : "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400"
                        }`}>
                          {res.type === "SALLE" ? <Home className="h-3 w-3" /> : <Laptop className="h-3 w-3" />}
                          {res.type === "SALLE" ? "Infrastructures" : "Matériel Lourd"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {res.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(res)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-blue-400 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(res.id)}
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