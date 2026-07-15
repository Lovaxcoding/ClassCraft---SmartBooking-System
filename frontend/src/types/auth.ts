export type UserRole = 'ADMIN' | 'RECEPTION' | 'DELEGUE';

export interface UserProfile {
  id: any;
  token: string;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}