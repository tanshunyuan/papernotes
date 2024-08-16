import { pgUserPlanEnum } from './../../../db/schema';
export const PROJECT_PERIMSSIONS = {
  CREATE: 'project:create',
  READ: 'project:read',
  READ_ALL: 'project:read_all',
  UPDATE: 'project:update',
  DELETE: 'project:delete',
} as const

export const ORGANISATION_TEAM_PERMISSIONS = {
  CREATE: 'organisation-team:create',
  READ: 'organisation-team:read',
  READ_ALL: 'organisation-team:read_all',
  UPDATE: 'organisation-team:update',
  DELETE: 'organisation-team:delete',
} as const

// alternate way to specify resource permissions on role
// const ORGANISATION_TEAM_RESOURCE = {
//   ADMIN: [
//     ORGANISATION_TEAM_PERMISSIONS.CREATE,
//     ORGANISATION_TEAM_PERMISSIONS.READ,
//     ORGANISATION_TEAM_PERMISSIONS.READ_ALL,
//     ORGANISATION_TEAM_PERMISSIONS.DELETE,
//   ],
//   MEMBER: [
//     ORGANISATION_TEAM_PERMISSIONS.READ,
//   ]
// }

/**@see {@link pgUserPlanEnum} */
export const PLAN_BASED_ROLE_PERMISSION = {
  FREE: [
    PROJECT_PERIMSSIONS.CREATE,
    PROJECT_PERIMSSIONS.READ,
    PROJECT_PERIMSSIONS.UPDATE,
  ],
  ENTERPRISE: {
    ADMIN: [
      PROJECT_PERIMSSIONS.CREATE,
      PROJECT_PERIMSSIONS.READ,
      PROJECT_PERIMSSIONS.READ_ALL,
      PROJECT_PERIMSSIONS.UPDATE,
      PROJECT_PERIMSSIONS.DELETE,
      ORGANISATION_TEAM_PERMISSIONS.CREATE,
      ORGANISATION_TEAM_PERMISSIONS.READ,
      ORGANISATION_TEAM_PERMISSIONS.READ_ALL,
      ORGANISATION_TEAM_PERMISSIONS.UPDATE
    ],
    MEMBER: [
      PROJECT_PERIMSSIONS.READ,
      PROJECT_PERIMSSIONS.CREATE,
      PROJECT_PERIMSSIONS.UPDATE,
      PROJECT_PERIMSSIONS.DELETE,
      ORGANISATION_TEAM_PERMISSIONS.READ,
    ]
  }
} as const



type ProjectPermission = typeof PROJECT_PERIMSSIONS[keyof typeof PROJECT_PERIMSSIONS]

export type Plans = keyof typeof PLAN_BASED_ROLE_PERMISSION
export type Permissions = ProjectPermission