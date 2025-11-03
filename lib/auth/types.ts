export type UserRole = 'admin' | 'editor' | 'reader';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}
