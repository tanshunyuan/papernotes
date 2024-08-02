export const PROJECT_PERIMSSIONS = {
  CREATE: 'project:create',
  READ_OWN: 'project:read_own',
  READ_ALL: 'project:read_all',
} as const

export const ROLE_PERMISSIONS = {
  ADMIN: [
    PROJECT_PERIMSSIONS.CREATE,
    PROJECT_PERIMSSIONS.READ_OWN,
    PROJECT_PERIMSSIONS.READ_ALL,
  ],
  MEMBER: [
    PROJECT_PERIMSSIONS.READ_OWN,
    PROJECT_PERIMSSIONS.CREATE
  ]
} as const


type ProjectPermission = typeof PROJECT_PERIMSSIONS[keyof typeof PROJECT_PERIMSSIONS]

export type Role = keyof typeof ROLE_PERMISSIONS
export type Permissions = ProjectPermission