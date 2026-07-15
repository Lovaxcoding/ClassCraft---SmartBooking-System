"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserProfile, AuthContextType, UserRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as UserRole;
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('user_id');
    const firstName = localStorage.getItem('first_name');
    const lastName = localStorage.getItem('last_name');

    if (token && role && username && userId) {
      setUser({
        id: parseInt(userId, 10),
        token,
        role,
        username,
        user_id: parseInt(userId, 10),
        first_name: firstName || '',
        last_name: lastName || ''
      });
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Appel à notre CustomAuthToken côté Django
      const response = await api.post<UserProfile>('login/', { username, password });
      const profile = response.data;

      // Stockage local
      localStorage.setItem('token', profile.token);
      localStorage.setItem('role', profile.role);
      localStorage.setItem('username', profile.username);
      localStorage.setItem('user_id', profile.user_id.toString());
      localStorage.setItem('first_name', profile.first_name);
      localStorage.setItem('last_name', profile.last_name);

      setUser(profile);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || "Identifiants incorrects";
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Notre Hook personnalisé useAuth() fortement typé
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};