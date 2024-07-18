"use client";
import { SignIn } from "@clerk/nextjs";


/**
 * @description Using pre-built clerkjs signin page
 * - If we want to customise @see {@link https://clerk.com/docs/custom-flows/use-sign-in}
 */
export default function SignInPage() {

  return (
    <>
      <SignIn />
    </>
  );
}
