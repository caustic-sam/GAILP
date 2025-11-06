// WordPress-style role hierarchy
export type UserRole = 'admin' | 'publisher' | 'contributor' | 'reader';

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

// Role capability helpers (WordPress-inspired)
export const RoleCapabilities = {
  admin: {
    canManageUsers: true,
    canManageSettings: true,
    canPublish: true,
    canEditAllContent: true,
    canAccessMedia: true,
    canAccessAnalytics: true,
    canAccessSecurity: true,
  },
  publisher: {
    canManageUsers: false,
    canManageSettings: false,
    canPublish: true,
    canEditAllContent: true,
    canAccessMedia: true,
    canAccessAnalytics: true,
    canAccessSecurity: false,
  },
  contributor: {
    canManageUsers: false,
    canManageSettings: false,
    canPublish: false,
    canEditAllContent: false, // only own content
    canAccessMedia: true, // limited
    canAccessAnalytics: false,
    canAccessSecurity: false,
  },
  reader: {
    canManageUsers: false,
    canManageSettings: false,
    canPublish: false,
    canEditAllContent: false,
    canAccessMedia: false,
    canAccessAnalytics: false,
    canAccessSecurity: false,
  },
} as const;

export function hasCapability(role: UserRole, capability: keyof typeof RoleCapabilities.admin): boolean {
  return RoleCapabilities[role][capability];
}
