export const ROUTE_PATHS = {
  DEFAULT: '/',
  SIGNIN: '/sign-in',
  SIGNUP: '/sign-up',
  APP: {
    PROJECT: {
      HOME: '/app/projects',
      DETAILS: (id: string) => `/app/projects/${id}`
    },
    TOOLS: {
      HOME: '/app/tools',
      ORGANISATION: {
        DETAILS: (id: string) => `/app/tools/organisation/${id}`
      }
    }
  }
}