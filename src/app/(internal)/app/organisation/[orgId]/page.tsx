'use client'

import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { ORGANISATION_TEAM_PERMISSIONS } from "~/server/domains/authorisation/utils/permissions"
import { api } from "~/trpc/react"
import { RouterOutputs } from "~/trpc/shared"
import { ROUTE_PATHS } from "~/utils/route-paths"

type OrganisationPageProps = {
  params: {
    orgId: string
  }
}
/**@todo only accessible by people with enterprise plan and they've a organisation */
export default function OrganisationPage(props: OrganisationPageProps) {
  const router = useRouter()

  const getUserDetailsQuery = api.user.getUserDetails.useQuery()
  const getOrganisationDetailsQuery = api.organisation.getOrganisationDetails.useQuery({
    organisationId: props.params.orgId
  })

  const isMe = (memberId: string) => {
    return getUserDetailsQuery.data?.id === memberId
  }

  if (
    getUserDetailsQuery.isLoading ||
    getOrganisationDetailsQuery.isLoading
  ) return <Typography>Loading...</Typography>

  if (!getUserDetailsQuery.data) return <Typography>Oh no! Something went wrong.</Typography>

  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  }}>
    <Box>
      <Typography variant="h5" sx={{ mb: '0.5rem' }}>Organisation Members</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getOrganisationDetailsQuery.data ?
              getOrganisationDetailsQuery.data.users.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name} {isMe(row.userId) ? <Typography variant="caption">(You)</Typography> : null}
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))
              : null
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>

    <Box>
      {getUserDetailsQuery.data.permissions?.includes('organisation-team:read_all') ?
        <AdminOrganisationTeamInfo
          orgId={props.params.orgId}
          userDetails={getUserDetailsQuery.data}
        /> : null
      }
      {
        getUserDetailsQuery.data.permissions?.includes('organisation-team:read') ?
          <MemberOrganisationTeamInfo
            orgId={props.params.orgId}
            userDetails={getUserDetailsQuery.data}
          /> : null
      }
    </Box>
  </Box>
}

const AdminOrganisationTeamInfo = (props: {
  orgId: string
  userDetails: NonNullable<RouterOutputs['user']['getUserDetails']>
}) => {
  const router = useRouter()
  const getAllOrganisationTeamsQuery = api.organisation.getAllOrganisationTeams.useQuery({
    organisationId: props.orgId
  })

  if (getAllOrganisationTeamsQuery.isLoading) return <Typography>Loading...</Typography>
  return <>
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Typography variant="h5" sx={{ mb: '0.5rem' }}>Organisation Teams</Typography>
      <Button variant="contained" onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.CREATE(props.userDetails?.organisation?.id))}>Create</Button>
    </Box>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem'
    }}>
      {getAllOrganisationTeamsQuery.data?.map(team => (
        <Box sx={{
          border: '1px solid #ccc',
          borderRadius: '0.5rem',
          p: '1rem'
        }} key={team.id}>
          <Typography variant="h6">{team.name}</Typography>
          <Typography>Created At: {team.createdAt.toLocaleDateString()}</Typography>
          <Button sx={{
            mt: '1rem'
          }} variant='contained' onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.DETAILS(props.orgId, team.id))}>More</Button>
        </Box>
      ))}
    </Box>
  </>
}

const MemberOrganisationTeamInfo = (props: {
  orgId: string
  userDetails: NonNullable<RouterOutputs['user']['getUserDetails']>
}) => {
  const isQueryEnabled = !!props.userDetails?.organisation?.teamId && props.userDetails.permissions.includes('organisation-team:read')
  const getAOrganisationTeamDetailQuery = api.organisation.getAOrganisationTeam.useQuery({
    organisationId: props.orgId,
    teamId: props.userDetails.organisation?.teamId
  }, {
    enabled: isQueryEnabled
  })
  const isMe = (memberId: string) => {
    return props.userDetails?.id === memberId
  }

  if (getAOrganisationTeamDetailQuery.isLoading) return <Typography>Loading...</Typography>
  return <>
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Typography variant="h5" sx={{ mb: '0.5rem' }}>Team Details</Typography>
    </Box>
    <Box>
      <Typography variant="body1">Team Name: {getAOrganisationTeamDetailQuery.data.orgTeam.name}</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getAOrganisationTeamDetailQuery.data ?
              getAOrganisationTeamDetailQuery.data.orgTeamUsers.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name} {isMe(row.userId) ? <Typography variant="caption">(You)</Typography> : null}
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.joinedAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))
              : null
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  </>
}
