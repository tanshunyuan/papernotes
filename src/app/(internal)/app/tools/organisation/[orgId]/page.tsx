'use client';

import { Box, Button, Divider, Typography } from "@mui/material";
import { api } from "~/trpc/react";
import { AddOrgUserDialog } from "./_components/dialogs/add-org-user-dialog";
import { useState } from "react";
import { UpdateOrgUserDialog } from "./_components/dialogs/update-org-user-dialog";

interface OrganisationDetailsPageProps {
  params: {
    orgId: string;
  }
}

export default function OrganisationDetailsPage(props: OrganisationDetailsPageProps) {
  const { params } = props;
  const { orgId } = params;
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [openUpdateOrgUserDialog, setOpenUpdateOrgUserDialog] = useState(false);
  const [activeOrgUserId, setActiveOrgUserId] = useState('');


  const organisationDetailsQuery = api.organisation.getOrganisationDetails.useQuery({
    organisationId: orgId
  })

  const handleUpdateOrgUser = (orgUserId: string) => {
    setActiveOrgUserId(orgUserId);
    setOpenUpdateOrgUserDialog(true);
  }

  if (organisationDetailsQuery.isLoading) return <Box>Loading...</Box>
  return <Box>
    <AddOrgUserDialog
      orgId={orgId}
      open={openAddUserDialog}
      setOpen={setOpenAddUserDialog}
    />
    <UpdateOrgUserDialog
      orgUserId={activeOrgUserId}
      open={openUpdateOrgUserDialog}
      setOpen={setOpenUpdateOrgUserDialog}
    />

    <Button onClick={() => setOpenAddUserDialog(true)}>Add User</Button>
    {organisationDetailsQuery.data ? <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <Box>
          <Typography>Organisation Id: {organisationDetailsQuery.data.organisation.id}</Typography>
          <Typography>Organisation Name: {organisationDetailsQuery.data.organisation.name}</Typography>
          <Typography>Organisation Description: {organisationDetailsQuery.data.organisation.description}</Typography>
          <Typography>Organisation Plan duration: {organisationDetailsQuery.data.organisation.planDurationStart.toDateString()} - {organisationDetailsQuery.data.organisation.planDurationEnd.toDateString()}</Typography>
          <Typography>Organisation Max Seats: {organisationDetailsQuery.data.organisation.maxSeats}</Typography>
          <Typography>Organisation Created At: {organisationDetailsQuery.data.organisation.createdAt.toDateString()}</Typography>
        </Box>
        <Divider />
        <Box>
          {organisationDetailsQuery.data.users.map((user) => (
            <>
              <Box key={user.id}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Box>
                    <Typography>User Id: {user.id}</Typography>
                    <Typography>User Created At: {user.createdAt.toDateString()}</Typography>
                    <Typography>User Role: {user.role}</Typography>
                    <Typography>User Email: {user.email}</Typography>
                  </Box>
                  <Button variant="contained" onClick={() => handleUpdateOrgUser(user.id)}>Update User</Button>
                </Box>
                <Divider sx={{ my: '0.5rem' }} />
              </Box>
            </>
          ))}
        </Box>
      </Box>
    </> : null}
  </Box>
}

