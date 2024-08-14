/* eslint-disable @typescript-eslint/no-floating-promises */
'use client'

import { Box, Button, Typography } from "@mui/material";
import { api } from "~/trpc/react";
import isEmpty from 'lodash/isEmpty'
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "~/utils/route-paths";

// view all the teams

interface OrganisationTeamPageProps {
  params: {
    orgId: string
  }
}
export default function OrganisationTeamPage(props: OrganisationTeamPageProps) {
  const organisationTeamQuery = api.organisation.getAllOrganisationTeams.useQuery({
    organisationId: props.params.orgId
  })
  const router = useRouter()

  if (organisationTeamQuery.isLoading) return <Typography>Loading...</Typography>
  const isDataEmpty = isEmpty(organisationTeamQuery.data)

  return <Box>
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignContent: 'center'
    }}>
      <Typography>Organisation Teams</Typography>
      <Button onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.CREATE(props.params.orgId))}>Create Team</Button>
    </Box>
    {isDataEmpty ? <Typography>No Teams</Typography> : <Box>
      <pre>{JSON.stringify(organisationTeamQuery.data, null, 2)}</pre>
    </Box>}
  </Box>
}