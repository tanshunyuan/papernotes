'use client'
// only viewable by authorised users - internal-employees
// everybody can CRUD all organisations

import { Box, Button, Typography } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { CreateOrganisationDialog } from "./_components/dialogs/create-organisation-dialog";
import { useState } from "react";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";

export default function ToolsPage() {
  const [openCreateOrganisationDialog, setOpenCreateOrganisationDialog] = useState(false);
  const organisationQuery = api.organisation.getAllOrganisations.useQuery()

  if (organisationQuery.isLoading) {
    return <div>Loading...</div>
  }

  return <LocalizationProvider dateAdapter={AdapterDayjs}>
    <CreateOrganisationDialog
      open={openCreateOrganisationDialog}
      setOpen={setOpenCreateOrganisationDialog}
    />
    <Box>
      <Typography variant="h5">Internal Tools</Typography>

      <Box>
        <Button onClick={() => setOpenCreateOrganisationDialog(true)}>Create Organisation</Button>
        <Box sx={{
          display: "flex",
          gap: '1rem',
        }}>
          {organisationQuery.data ? organisationQuery.data.map((organisation) => (
            <OrganisationItem key={organisation.id} organisation={organisation} />
          )) : null}
        </Box>
      </Box>
    </Box>
  </LocalizationProvider>

}

interface OrganisationGalleryProps {
  organisation: RouterOutputs['organisation']['getAllOrganisations'][number]
}
const OrganisationItem = (props: OrganisationGalleryProps) => {
  const { organisation } = props

  return <Box
    sx={{
      border: '1px solid #313033',
      padding: '1rem',
      width: 'max-content',
      borderRadius: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}
  >
    <Typography variant="h6">{organisation.name}</Typography>
    <Typography variant="body1">{organisation.description}</Typography>
    <Typography variant="body1">{organisation.planDurationStart.toDateString()} to {organisation.planDurationEnd.toDateString()}</Typography>
    <Typography variant="body1">Max Seats: {organisation.maxSeats}</Typography>
  </Box>
}