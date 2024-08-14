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
    orgTeamId: string
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
    {isDataEmpty ? <Typography>No Teams</Typography> : <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {
        organisationTeamQuery.data?.map((team) => {
          return <Box key={team.id}>
            <Typography>{team.name}</Typography>
            <Button variant='contained' onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.DETAILS(props.params.orgId, team.id))}>More</Button>
          </Box>
        })
      }
    </Box>}
  </Box>
}