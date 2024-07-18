import { SignUp } from "@clerk/nextjs";

/**
 * @description Using pre-built clerkjs signup page
 * - If we want to customise @see {@link https://clerk.com/docs/custom-flows/use-sign-up}
 */
export default function SignUpPage() {
  return <SignUp />;
}
