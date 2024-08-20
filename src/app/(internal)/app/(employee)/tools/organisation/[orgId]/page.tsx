'use client';

import { Box, Button, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { api } from "~/trpc/react";
import { AddOrgUserDialog } from "./_components/dialogs/add-org-user-dialog";
import { useState } from "react";
import { UpdateOrgUserDialog } from "./_components/dialogs/update-org-user-dialog";
import { UpsertOrgResourcesForm } from "./_components/form/upsert-org-resource-limit-form";

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

    {organisationDetailsQuery.data ? <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <Typography variant="h6">Organisation Details</Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="organisation details table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Plan Duration</TableCell>
                <TableCell>Max Seats</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{organisationDetailsQuery.data.organisation.id}</TableCell>
                <TableCell>{organisationDetailsQuery.data.organisation.name}</TableCell>
                <TableCell>{organisationDetailsQuery.data.organisation.description}</TableCell>
                <TableCell>{`${organisationDetailsQuery.data.organisation.planDurationStart.toDateString()} - ${organisationDetailsQuery.data.organisation.planDurationEnd.toDateString()}`}</TableCell>
                <TableCell>{organisationDetailsQuery.data.organisation.maxSeats}</TableCell>
                <TableCell>{organisationDetailsQuery.data.organisation.createdAt.toDateString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />
        <UpsertOrgResourcesForm
          orgId={organisationDetailsQuery.data.organisation.id}
          resourceLimits={organisationDetailsQuery.data.resourceLimits}
        />
        <Divider />
        <Box>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: '0.5rem'
          }}>
            <Typography variant="h6" >Organisation Users</Typography>
            <Button variant="contained" onClick={() => setOpenAddUserDialog(true)}>Add User</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="organisation users table">
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organisationDetailsQuery.data.users.map((user) => (
                  <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.createdAt.toDateString()}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handleUpdateOrgUser(user.id)}>
                        Update User
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </> : null}
  </Box>
}

