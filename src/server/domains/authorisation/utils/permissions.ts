import { pgUserPlanEnum } from './../../../db/schema';
export const PROJECT_PERIMSSIONS = {
  CREATE: 'project:create',
  READ: 'project:read',
  READ_ALL: 'project:read_all',
  UPDATE: 'project:update',
  DELETE: 'project:delete',
} as const

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
      PROJECT_PERIMSSIONS.DELETE
    ],
    MEMBER: [
      PROJECT_PERIMSSIONS.READ,
      PROJECT_PERIMSSIONS.CREATE,
      PROJECT_PERIMSSIONS.UPDATE,
      PROJECT_PERIMSSIONS.DELETE
    ]
  }
} as const



type ProjectPermission = typeof PROJECT_PERIMSSIONS[keyof typeof PROJECT_PERIMSSIONS]

export type Plans = keyof typeof PLAN_BASED_ROLE_PERMISSION
export type Permissions = ProjectPermission