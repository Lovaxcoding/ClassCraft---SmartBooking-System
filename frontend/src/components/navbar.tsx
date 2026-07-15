"use client";

import { useAuth } from "@/context/authContext";
import { ModeToggle } from "./mode-toggle";
import { LayoutDashboard, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center justify-between">
        
        {/* Logo & Identité visuelle */}
        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="tracking-tight bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            SmartBooking
          </span>
          <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-md">
            v1.0
          </span>
        </div>

        {/* Section Actions & Profil de session */}
        <div className="flex items-center gap-4">
          
          {/* Badge utilisateur connecté */}
          <div className="hidden items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/50 py-1 pl-1.5 pr-3 text-xs md:flex dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <User className="h-3 w-3" />
            </div>
            <div className="text-left leading-tight">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.first_name} {user?.last_name}
              </p>
              <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Shield className="h-2 w-2 text-blue-500" /> {user?.role}
              </span>
            </div>
          </div>

          {/* Bouton Dark / Light mode */}
          <ModeToggle />

          {/* Bouton de Déconnexion discret */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>

        </div>
      </div>
    </header>
  );
}