export const ROUTE_PATHS = {
  DEFAULT: '/',
  SIGNIN: '/sign-in',
  SIGNUP: '/sign-up',
  APP: {
    PROJECT: {
      HOME: '/app/projects',
      DETAILS: (id: string) => `/app/projects/${id}`
    },
    ORGANISATION: {
      HOME: (orgId: string) => `/app/organisation/${orgId}`,
      TEAMS: {
        HOME: (orgId: string) => `/app/organisation/${orgId}/team`,
        CREATE: (orgId: string) => `/app/organisation/${orgId}/team/create`,
        DETAILS: (orgId: string, id: string) => `/app/organisation/${orgId}/team/${id}`
      }
    },
    TOOLS: {
      HOME: '/app/tools',
      ORGANISATION: {
        CREATE: '/app/tools/organisation/create',
        DETAILS: (id: string) => `/app/tools/organisation/${id}`
      }
    }
  }
}