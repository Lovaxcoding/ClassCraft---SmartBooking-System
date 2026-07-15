"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/authContext";
import { ShieldCheck, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Consommation directe de l'API Django sécurisée via notre hook
    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error || "Identifiants incorrects. Veuillez réessayer.");
      setIsLoading(false);
    }
    // En cas de succès, le hook redirige automatiquement vers /dashboard
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        
        {/* Header de la carte */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            SmartBooking Admin
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire de connexion */}
        <form className="mt-6 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nom d'utilisateur
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin ou nom_utilisateur"
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}