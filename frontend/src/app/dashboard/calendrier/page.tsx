"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Reservation, ReservationStatus, Resource } from "@/types/reservation";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Loader2, 
  Layers,
  Sparkles,
  Info
} from "lucide-react";

// Configuration des heures d'affichage du calendrier scolaire
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

export default function CalendrierStatutPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Semaine active de visualisation (par défaut : semaine courante)
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const [resList, reserveList] = await Promise.all([
          api.get<Resource[]>("ressources/"),
          api.get<Reservation[]>("reservations/")
        ]);
        setResources(resList.data);
        setReservations(reserveList.data);
        if (resList.data.length > 0) {
          setSelectedResourceId(resList.data[0].id.toString());
        }
      } catch (err) {
        console.error("Erreur de chargement du calendrier", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  // --- LOGIQUE DE CALCUL DES DATES DE LA SEMAINE ---
  const getWeekDates = (baseDate: Date) => {
    const week = [];
    const current = new Date(baseDate);
    const day = current.getDay();
    // Ajustement pour caler le lundi en premier (0 = Dimanche, 1 = Lundi...)
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); 
    current.setDate(diff);

    for (let i = 0; i < 5; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const formatQueryDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Naviguer entre les semaines
  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  // Trouver une réservation spécifique pour un jour et un créneau horaire
  const getReservationForSlot = (dateStr: string, hourStr: string) => {
    const hourNum = parseInt(hourStr.split(":")[0], 10);
    
    return reservations.find((res) => {
      if (res.ressource.toString() !== selectedResourceId || res.date !== dateStr) return false;
      
      const startHour = parseInt(res.heure_debut.split(":")[0], 10);
      const endHour = parseInt(res.heure_fin.split(":")[0], 10);
      
      // Vérifie si l'heure du calendrier tombe dans la plage horaire de la réservation
      return hourNum >= startHour && hourNum < endHour;
    });
  };

  // Helper pour styliser selon le statut de la réservation
  const getStatusStyles = (status: ReservationStatus) => {
    switch (status) {
      case "PRISE":
        return "bg-rose-500/10 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400";
      case "EN_PAUSE":
        return "bg-amber-500/10 border-amber-500 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
      default:
        return "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
    }
  };

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case "PRISE": return "Prise / Confirmée";
      case "EN_PAUSE": return "En Pause / Maintenance";
      default: return "Disponible";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Synchronisation de l'agenda ClassCraft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" /> Planning de Disponibilité
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualisez instantanément l'état de chaque local classé par code couleur.
          </p>
        </div>

        {/* Sélecteur de ressource à analyser */}
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="rounded-lg border border-border  p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {resources.map((res) => (
              <option key={res.id} value={res.id}>
                {res.nom} ({res.type === "SALLE" ? "Salle" : "Matériel"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Légende interactive des statuts */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-border dark:bg-slate-950 bg-white  p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Disponible (Libre d'accès)</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          <span className="text-muted-foreground">Prise (Réservation Active)</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">En Pause (Maintenance / Réservé Administration)</span>
        </div>
      </div>

      {/* Navigation temporelle de la semaine */}
      <div className="flex items-center dark:bg-slate-950 bg-white justify-between rounded-xl border border-border  p-3 shadow-sm">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-foreground">
          Semaine du {weekDates[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au {weekDates[4].toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* --- GRILLE DU CALENDRIER HEBDOMADAIRE --- */}
      <div className="rounded-xl border border-border dark:bg-slate-950 bg-white p-4 shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          
          {/* Ligne d'en-tête (Jours de la semaine) */}
          <div className="grid grid-cols-6 border-b border-border pb-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <div className="text-left pl-4 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Heures
            </div>
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="flex flex-col items-center gap-0.5">
                <span>{day}</span>
                <span className="text-[10px] text-primary font-medium">
                  {weekDates[index].toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" })}
                </span>
              </div>
            ))}
          </div>

          {/* Corps de la Grille */}
          <div className="divide-y divide-border">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-6 items-stretch py-2 min-h-[4rem]">
                
                {/* Colonne heure de gauche */}
                <div className="flex items-center text-xs font-semibold text-muted-foreground pl-4">
                  {hour}
                </div>

                {/* Les cellules de chaque jour de la semaine */}
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  const dateStr = formatQueryDate(weekDates[dayIndex]);
                  const reservation = getReservationForSlot(dateStr, hour);
                  
                  // Déterminer le statut par défaut si pas de réservation
                  const activeStatus: ReservationStatus = reservation ? reservation.statut : "DISPONIBLE";

                  return (
                    <div key={dayIndex} className="px-1.5 py-1">
                      <div className={`h-full w-full rounded-lg border-l-4 p-2 transition-all flex flex-col justify-between ${getStatusStyles(activeStatus)}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wide">
                          {getStatusLabel(activeStatus)}
                        </div>
                        
                        {reservation ? (
                          <div className="mt-1 flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {reservation.utilisateur_details 
                                ? `${reservation.utilisateur_details.first_name} ${reservation.utilisateur_details.last_name}`
                                : `Réservation #${reservation.id}`
                              }
                            </span>
                            <span className="text-[9px] opacity-75">
                              {reservation.heure_debut.substring(0, 5)} - {reservation.heure_fin.substring(0, 5)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] opacity-60">Créneau libre</span>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}