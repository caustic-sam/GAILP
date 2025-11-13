// Feature flags for controlling section visibility
export interface FeatureFlags {
  showPolicyPulse: boolean;
  showVideos: boolean;
  showArticles: boolean;
  showPolicies: boolean;
  showBlog: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  showPolicyPulse: true,
  showVideos: true,
  showArticles: true,
  showPolicies: true,
  showBlog: true,
};

const STORAGE_KEY = 'gailp_feature_flags';

export function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') return DEFAULT_FLAGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error reading feature flags:', error);
  }

  return DEFAULT_FLAGS;
}

export function setFeatureFlags(flags: Partial<FeatureFlags>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getFeatureFlags();
    const updated = { ...current, ...flags };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving feature flags:', error);
  }
}

export function resetFeatureFlags(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting feature flags:', error);
  }
}
