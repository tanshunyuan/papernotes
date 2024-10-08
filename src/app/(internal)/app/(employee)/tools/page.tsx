'use client'

import { Box, Button, Typography } from "@mui/material";
import { type RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "~/utils/route-paths";

export default function ToolsPage() {
  const organisationQuery = api.organisation.getAllOrganisations.useQuery()
  const router = useRouter()

  if (organisationQuery.isLoading) {
    return <div>Loading...</div>
  }

  return <Box>
    <Typography variant="h5">Internal Tools</Typography>

    <Box>
      <Button onClick={() => router.push(ROUTE_PATHS.APP.TOOLS.ORGANISATION.CREATE)}>Create Organisation</Button>
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

}

interface OrganisationGalleryProps {
  organisation: RouterOutputs['organisation']['getAllOrganisations'][number]
}
const OrganisationItem = (props: OrganisationGalleryProps) => {
  const { organisation } = props
  const router = useRouter()

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
    <Button variant="contained" onClick={() => router.push(ROUTE_PATHS.APP.TOOLS.ORGANISATION.DETAILS(organisation.id))}>More</Button>
  </Box>
}