import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { ROUTE_PATHS } from "./utils/route-paths";
import { NextResponse } from "next/server";
import { env } from "./env";

const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname === ROUTE_PATHS.DEFAULT) {
    const signInRedirectUrl = new URL(ROUTE_PATHS.SIGNIN, req.url);
    return NextResponse.redirect(signInRedirectUrl);
  }
  if (!auth().userId) {
    return auth().redirectToSignIn({
      returnBackUrl: ROUTE_PATHS.SIGNIN
    })
  }

  if (isProtectedRoute(req)) auth().protect();
}, {
  afterSignInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  afterSignUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  signInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  signUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  debug: true
});

export const config = {
  matcher: ["/((?!.*\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};