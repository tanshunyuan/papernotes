'use client'
import { redirect } from "next/navigation";
import { api } from "~/trpc/react";
import type { BaseChildrenProps } from "~/types/common";
import { ROUTE_PATHS } from "~/utils/route-paths";

export default function OrganisationLayout(props: BaseChildrenProps) {
  const { children } = props;
  const getUserDetailsQuery = api.user.getUserDetails.useQuery();


  if (getUserDetailsQuery.isLoading) return <div>Loading...</div>

  if (!getUserDetailsQuery.data?.organisation) {
    redirect(ROUTE_PATHS.APP.PROJECT.HOME)
  }

  return <>
    {children}
  </>
}