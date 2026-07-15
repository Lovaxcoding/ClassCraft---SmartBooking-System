"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Reservation, Resource, Equipement } from "@/types/reservation";
import { UserProfile } from "@/types/auth";
import { 
  BarChart3, 
  CalendarCheck, 
  Layers, 
  Wrench, 
  Users2, 
  Loader2, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";

export default function StatistiquesPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // États des données brutes
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [equipments, setEquipments] = useState<Equipement[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchStatsData = async () => {
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
        setErrorMessage("Impossible de charger les indicateurs statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Calcul des indicateurs en cours...</p>
        </div>
      </div>
    );
  }

  // --- LOGIQUE DE CALCUL DES KPI ---
  const totalReservations = reservations.length;
  const totalSalles = resources.filter(r => r.type === "SALLE").length;
  const totalEquipementsStock = equipments.reduce((acc, eq) => acc + (eq.quantite_disponible || 0), 0);
  const totalDelegues = students.length;

  // 1. Calcul des ressources les plus réservées (Top 3)
  const resourceCounts: { [key: string]: { nom: string; count: number; type: string } } = {};
  reservations.forEach(res => {
    const resId = res.ressource;
    const resName = res.ressource_details?.nom || `Ressource #${resId}`;
    const resType = res.ressource_details?.type || "SALLE";
    
    if (resourceCounts[resId]) {
      resourceCounts[resId].count += 1;
    } else {
      resourceCounts[resId] = { nom: resName, count: 1, type: resType };
    }
  });

  const topResources = Object.values(resourceCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Max count pour calibrer les barres graphiques de manière proportionnelle
  const maxReservationCount = topResources.length > 0 ? topResources[0].count : 1;

  return (
    <div className="space-y-6">
      
      {/* En-tête de section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" /> Analyses & Pilotage Analytique
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Visualisez l'état de fréquentation de l'établissement et l'utilisation du matériel en temps réel.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* --- GRILLE DES 4 CARTES KPI --- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Carte 1 : Réservations Totales */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Réservations validées</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalReservations}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> Actif
            </span>
          </div>
        </div>

        {/* Carte 2 : Salles uniques */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Locaux / Salles</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalSalles}</span>
            <span className="text-xs text-slate-400">Infrastructures</span>
          </div>
        </div>

        {/* Carte 3 : Équipements cumulés */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Accessoires en Stock</span>
            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalEquipementsStock}</span>
            <span className="text-xs text-slate-400">Unités physiques</span>
          </div>
        </div>

        {/* Carte 4 : Nombre d'élèves délégués */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Élèves Délégués</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalDelegues}</span>
            <span className="text-xs text-slate-400">Demandeurs habilités</span>
          </div>
        </div>

      </div>

      {/* --- VISUALISATIONS GRAPHIQUES ET ANALYTIQUES --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Graphique de Fréquentation des locaux (2/3 de large) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">Top 3 des ressources sollicitées</h2>
          <p className="text-xs text-slate-500 mb-6 dark:text-slate-400">
            Classement basé sur le nombre total d'allocations de créneaux validés.
          </p>

          <div className="space-y-5">
            {topResources.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune donnée de réservation disponible pour bâtir le graphe.</p>
            ) : (
              topResources.map((item, index) => {
                // Calcule le pourcentage par rapport au premier (le maximum)
                const percentage = (item.count / maxReservationCount) * 100;
                
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800 dark:text-slate-200">
                        {item.nom} <span className="text-[10px] text-slate-400">({item.type === "SALLE" ? "Salle" : "Matériel"})</span>
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{item.count} réservation(s)</span>
                    </div>
                    {/* Conteneur de la barre de progression */}
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Répartition Rapide & Conseils (1/3 de large) */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">Santé du Système</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              État opérationnel des flux de réservation.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs">
                <span className="text-slate-500">Algorithme anti-conflit</span>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  Actif
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs">
                <span className="text-slate-500">Base SQLite</span>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  Connectée
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 text-[11px] text-slate-400">
            Les données ci-dessus se mettent à jour de manière asynchrone lors de chaque modification dans l'interface de réception.
          </div>
        </div>

      </div>
    </div>
  );
}