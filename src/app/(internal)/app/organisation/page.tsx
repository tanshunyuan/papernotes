'use client'

import { Box, Typography } from "@mui/material"
import { api } from "~/trpc/react"

// only accessible by people with enterprise plan and they've a organisation
export default function OrganisationPage() {
  const getUserDetailsQuery = api.user.getUserDetails.useQuery()

  if (getUserDetailsQuery.isLoading) return <div>Loading...</div>
  return <Box>
    <Typography>Organisation: {getUserDetailsQuery.data?.organisation?.name}</Typography>

  </Box>
}