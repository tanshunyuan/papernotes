'use client';

import { SignOutButton } from "@clerk/nextjs";
import { useSeedNewUser } from "~/hooks/use-seed-user";
import { api } from "~/trpc/react";

export default function ProjectsPage() {
  useSeedNewUser();
  return <div>
    projects
  </div>
}