'use client'

import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { api } from "~/trpc/react"
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
  const getAllOrganisationTeamsQuery = api.organisation.getAllOrganisationTeams.useQuery({
    organisationId: props.params.orgId
  })

  const getAOrganisationTeamDetailQuery = api.organisation.getAOrganisationTeam.useQuery({
    organisationId: props.params.orgId,
    teamId: getUserDetailsQuery.data?.organisation?.teamId
  }, {
    enabled: !!getUserDetailsQuery.data?.organisation?.teamId
  })

  const isMe = (memberId: string) => {
    return getUserDetailsQuery.data?.id === memberId
  }

  if (
    getUserDetailsQuery.isLoading ||
    getOrganisationDetailsQuery.isLoading ||
    getAllOrganisationTeamsQuery.isLoading ||
    getAOrganisationTeamDetailQuery.isLoading
  ) return <Typography>Loading...</Typography>

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
      {/* only for enterprise plan ADMIN -- START */}
      {/* <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h5" sx={{ mb: '0.5rem' }}>Organisation Teams</Typography>
        <Button variant="contained" onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.CREATE(getUserDetailsQuery.data?.organisation?.id))}>Create</Button>
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
            }} variant='contained' onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.DETAILS(props.params.orgId, team.id))}>More</Button>
          </Box>
        ))}
      </Box> */}
      {/* only for enterprise plan ADMIN -- END */}

      {/* only for enterprise plan MEMBER -- START */}
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
      {/* only for enterprise plan MEMBER -- END */}


    </Box>
  </Box>
}

