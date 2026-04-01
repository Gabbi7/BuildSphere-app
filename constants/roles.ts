/**
 * BuildSphere RBAC — Final Verified Mapping
 * Stable, pure Javascript/Typescript logic for capstone defense.
 */

export type UserRole =
  | 'foreman'
  | 'project_engineer'
  | 'project_coordinator'
  | 'ceo'
  | 'coo'
  | 'procurement'
  | 'hr'
  | 'human_resource'
  | 'human_resources'
  | 'sales'
  | 'accounting'
  | 'general_staff'
  | 'staff';

export interface Permissions {
  canViewDashboard: boolean;
  canCreateTasks: boolean;
  canViewInventory: boolean;
  canEditInventory: boolean;
  canAddInventory: boolean;
  canSubmitSiteUpdates: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  ceo: {
    canViewDashboard: true,
    canCreateTasks: true,
    canViewInventory: true,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
  coo: {
    canViewDashboard: true,
    canCreateTasks: true,
    canViewInventory: true,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
  project_engineer: {
    canViewDashboard: true,
    canCreateTasks: true,
    canViewInventory: true,
    canEditInventory: true,
    canAddInventory: true,
    canSubmitSiteUpdates: true,
  },
  foreman: { // or supervisor
    canViewDashboard: false,
    canCreateTasks: false,
    canViewInventory: true,
    canEditInventory: true,
    canAddInventory: false,
    canSubmitSiteUpdates: true,
  },
  project_coordinator: {
    canViewDashboard: true,
    canCreateTasks: true,
    canViewInventory: true,
    canEditInventory: true,
    canAddInventory: true,
    canSubmitSiteUpdates: false,
  },
  procurement: {
    canViewDashboard: false,
    canCreateTasks: true,
    canViewInventory: true,
    canEditInventory: true,
    canAddInventory: true,
    canSubmitSiteUpdates: false,
  },
  hr: {
    canViewDashboard: false,
    canCreateTasks: true,
    canViewInventory: false,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
  human_resource: {
    canViewDashboard: false,
    canCreateTasks: true,
    canViewInventory: false,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
  human_resources: {
    canViewDashboard: false,
    canCreateTasks: true,
    canViewInventory: false,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
  sales: {
    canViewDashboard: false,
    canCreateTasks: true,
    canViewInventory: false,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
  // Accounting: Audit-Only via Tasks (Home hidden)
  accounting: {
    canViewDashboard: false,
    canCreateTasks: false,
    canViewInventory: true,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
  general_staff: {
    canViewDashboard: false,
    canCreateTasks: false,
    canViewInventory: false,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
  staff: {
    canViewDashboard: false,
    canCreateTasks: false,
    canViewInventory: false,
    canEditInventory: false,
    canAddInventory: false,
    canSubmitSiteUpdates: false,
  },
};

export function getPermissions(role?: string): Permissions {
  const key = (role || 'general_staff')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') as UserRole;
  return ROLE_PERMISSIONS[key] || ROLE_PERMISSIONS.general_staff;
}
