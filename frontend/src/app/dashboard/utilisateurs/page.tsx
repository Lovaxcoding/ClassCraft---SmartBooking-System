"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserProfile, UserRole } from "@/types/auth";
import { 
  Users2, 
  UserPlus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  GraduationCap
} from "lucide-react";

export default function UtilisateursPage() {
  // États pour les données
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  
  // États du formulaire (Mode création ou édition)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>(""); // Requis uniquement à la création
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<UserRole>("DELEGUE");

  // États de retour API
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 1. Récupérer la liste des utilisateurs depuis Django
  const fetchUsers = async () => {
    try {
      const response = await api.get<UserProfile[]>("utilisateurs/");
      setUsers(response.data);
    } catch (err) {
      setErrorMessage("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Nettoyer les messages flash après 4 secondes
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
    setCurrentUserId(null);
    setUsername("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("DELEGUE");
  };

  // 2. Soumission : Création ou Mise à jour (C / U du CRUD)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload: any = {
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      role
    };

    // On n'envoie le mot de passe que s'il est fourni (obligatoire en création, optionnel en édition)
    if (password) {
      payload.password = password;
    }

    try {
      if (isEditing && currentUserId) {
        // Mode Édition (PUT ou PATCH)
        await api.patch(`utilisateurs/${currentUserId}/`, payload);
        setSuccessMessage("Utilisateur mis à jour avec succès !");
      } else {
        // Mode Création (POST)
        if (!password) {
          setErrorMessage("Le mot de passe est obligatoire pour un nouvel utilisateur.");
          setSubmitLoading(false);
          return;
        }
        await api.post("utilisateurs/", payload);
        setSuccessMessage("Nouvel utilisateur créé avec succès !");
      }
      resetForm();
      fetchUsers();
    } catch (err: any) {
      const serverError = err.response?.data;
      if (serverError && typeof serverError === "object") {
        // Extraire la première erreur renvoyée par Django
        const firstKey = Object.keys(serverError)[0];
        setErrorMessage(`${firstKey} : ${serverError[firstKey][0]}`);
      } else {
        setErrorMessage("Une erreur est survenue lors de l'enregistrement.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Préparer le mode édition
  const handleEditClick = (user: UserProfile) => {
    setIsEditing(true);
    setCurrentUserId(user.user_id);
    setUsername(user.username);
    setPassword(""); // On laisse vide, Django ne doit pas afficher le hash
    setFirstName(user.first_name);
    setLastName(user.last_name);
    // Note : si ton API ne renvoie pas l'email dans la liste globale, gère une valeur par défaut
    setEmail((user as any).email || "");
    setRole(user.role);
  };

  // 4. Suppression (D du CRUD)
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;

    try {
      await api.delete(`utilisateurs/${id}/`);
      setSuccessMessage("Utilisateur supprimé de la base SQLite.");
      fetchUsers();
    } catch (err) {
      setErrorMessage("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users2 className="h-6 w-6 text-blue-600" /> Gestion des Comptes Utilisateurs
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Ajoutez, modifiez ou révoquez les accès des élèves délégués et du personnel.
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

      {/* Grid principale : Formulaire (1/3) & Liste (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
            <UserPlus className="h-5 w-5 text-blue-500" />
            {isEditing ? "Modifier l'utilisateur" : "Nouveau Compte"}
          </h2>
          <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
            {isEditing ? "Modifiez les propriétés de ce profil." : "Remplissez les identifiants requis par Django."}
          </p>

          <form onSubmit={handleSaveUser} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom d'utilisateur (Username)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: jean.dupont"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {!isEditing && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mot de passe</label>
                <input
                  type="password"
                  required={!isEditing}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prénom</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Adresse E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean.dupont@ispm.mg"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rôle d'accès</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="DELEGUE">Élève Délégué / Responsable</option>
                <option value="RECEPTION">Réceptionniste / Accueil</option>
                <option value="ADMIN">Responsable Principal</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {submitLoading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le compte"}
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

        {/* COLONNE DROITE : LISTE À DROITE */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">Comptes enregistrés</h2>
          <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
            Aperçu en temps réel des profils d'utilisateurs connectés à la base de données.
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Identité / Username</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 dark:text-slate-500">
                      Aucun utilisateur trouvé en base de données.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {u.first_name} {u.last_name}
                          </span>
                          <span className="text-xs text-slate-400">@{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {(u as any).email || "Non renseigné"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                          u.role === "ADMIN" 
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" 
                            : u.role === "RECEPTION" 
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}>
                          {u.role === "DELEGUE" && <GraduationCap className="h-3 w-3" />}
                          {u.role === "ADMIN" ? "Responsable" : u.role === "RECEPTION" ? "Accueil" : "Élève Délégué"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-blue-400 transition-colors"
                            title="Modifier ce compte"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.user_id)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-red-400 transition-colors"
                            title="Supprimer ce compte"
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