'use client'

import { Box, Button, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import { ROUTE_PATHS } from "~/utils/route-paths"

// only accessible by people with enterprise plan and they've a organisation
export default function OrganisationPage() {
  const getUserDetailsQuery = api.user.getUserDetails.useQuery()
  const router = useRouter()

  if (getUserDetailsQuery.isLoading) return <div>Loading...</div>
  return <Box>
    <Button onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.HOME)}>Manage Teams</Button>
    <Typography>Organisation: {getUserDetailsQuery.data?.organisation?.name}</Typography>
  </Box>
}