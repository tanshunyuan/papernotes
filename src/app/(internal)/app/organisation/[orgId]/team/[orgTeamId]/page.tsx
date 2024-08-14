'use client';

import { Box, Button, Typography } from "@mui/material";
import { isEmpty } from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";
import { ROUTE_PATHS } from "~/utils/route-paths";
import { AddOrgTeamMemberDialog } from "./_components/add-org-team-member-dialog";

type OrganisationTeamDetailsPageProps = {
  params: {
    orgId: string
    orgTeamId: string
  }
}

/**
 * @todo 
 * 1. Implement add oragnisation user to a team
 * 2. Once a user is added to a team prevent them from being added to another team
 * 3. Fetch current org users
 * 4. Fetch all org users for a team
 */
export default function OrganisationTeamDetailsPage(props: OrganisationTeamDetailsPageProps) {
  const [openAddOrgTeamMemberDialog, setOpenAddOrgTeamMemberDialog] = useState(false)
  const organisationTeamDetailsQuery = api.organisation.getAOrganisationTeam.useQuery({
    organisationId: props.params.orgId,
    teamId: props.params.orgTeamId
  })
  const router = useRouter()

  if (organisationTeamDetailsQuery.isLoading) return <Typography>Loading...</Typography>
  if (organisationTeamDetailsQuery.isError) {
    toast.error(organisationTeamDetailsQuery.error.message)
    router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.HOME(props.params.orgId))
  }

  const isDataEmpty = isEmpty(organisationTeamDetailsQuery.data)

  return <Box>
    <AddOrgTeamMemberDialog
      open={openAddOrgTeamMemberDialog}
      setOpen={setOpenAddOrgTeamMemberDialog}
      teamId={props.params.orgTeamId}
      orgId={props.params.orgId}
    />
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignContent: 'center'
    }}>
      <Button onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.HOME(props.params.orgId))}>
        Go Back
      </Button>
      <Typography>
        Organisation Team Details
      </Typography>
      <Button onClick={() => setOpenAddOrgTeamMemberDialog(true)}>Add Members</Button>
    </Box>
    {!isDataEmpty ? <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <pre>{JSON.stringify(organisationTeamDetailsQuery.data, null, 2)}</pre>
    </Box> : null}
  </Box>
}