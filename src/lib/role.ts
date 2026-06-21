export const ROLES = {
  ADMIN: import.meta.env.VITE_ROLE_ADMIN,
  SUPER_EDUCATOR: import.meta.env.VITE_ROLE_SUPER_EDUCATOR,
  EDUCATOR: import.meta.env.VITE_ROLE_EDUCATOR,
  CONTRIBUTOR: import.meta.env.VITE_ROLE_CONTRIBUTOR,
  LEARNER: import.meta.env.VITE_ROLE_LEARNER,
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const isAdmin = (roles: string[]) => roles.includes(ROLES.ADMIN);
export const isSuperEducator = (roles: string[]) =>
  roles.includes(ROLES.SUPER_EDUCATOR);
export const isEducator = (roles: string[]) => roles.includes(ROLES.EDUCATOR);
export const isLearner = (roles: string[]) => roles.includes(ROLES.LEARNER);
export const isContributor = (roles: string[]) =>
  roles.includes(ROLES.CONTRIBUTOR);

export const hasRole = (roles: string[], role: string) => roles.includes(role);
