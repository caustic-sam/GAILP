// Simplified role hierarchy for MVP launch
// V1.1 may add back 'publisher' | 'contributor'
export type UserRole = 'admin' | 'reader';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  session_duration_hours?: number | null;
  last_sign_in?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Role capability helpers - Simplified for MVP
export const RoleCapabilities = {
  admin: {
    canManageUsers: true,
    canManageSettings: true,
    canPublish: true,
    canEditAllContent: true,
    canAccessMedia: true,
    canAccessAnalytics: true,
    canAccessSecurity: true,
    canAccessAdmin: true,
  },
  reader: {
    canManageUsers: false,
    canManageSettings: false,
    canPublish: false,
    canEditAllContent: false,
    canAccessMedia: false,
    canAccessAnalytics: false,
    canAccessSecurity: false,
    canAccessAdmin: false,
  },
} as const;

export function hasCapability(role: UserRole, capability: keyof typeof RoleCapabilities.admin): boolean {
  return RoleCapabilities[role][capability];
}
