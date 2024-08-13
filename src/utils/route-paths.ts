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
      HOME: '/app/organisation',
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