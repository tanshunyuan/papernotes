'use client';

import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { isEmpty } from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";
import { ROUTE_PATHS } from "~/utils/route-paths";
import { AddOrgTeamMemberDialog } from "./_components/add-org-team-member-dialog";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CloseIcon from '@mui/icons-material/Close';
import { type RouterOutputs } from "~/trpc/shared";

type OrganisationTeamDetailsPageProps = {
  params: {
    orgId: string
    orgTeamId: string
  }
}

export default function OrganisationTeamDetailsPage(props: OrganisationTeamDetailsPageProps) {
  const router = useRouter()
  const [openAddOrgTeamMemberDialog, setOpenAddOrgTeamMemberDialog] = useState(false)
  const organisationTeamDetailsQuery = api.organisation.getAOrganisationTeam.useQuery({
    organisationId: props.params.orgId,
    teamId: props.params.orgTeamId
  })

  const removeOrganisationTeamMemberMutation = api.organisation.removeOrganisationTeamMember.useMutation()
  const organisationContext = api.useUtils().organisation

  const handleRemoveTeamMember = (args: { memberId: string, teamId: string }) => {
    removeOrganisationTeamMemberMutation.mutate({
      memberId: args.memberId,
      orgTeamId: args.teamId
    }, {
      onSuccess: () => {
        toast.success("Member removed successfully")
      },
      onError: (data) => {
        toast.error(`Error removing member: ${data.message}`)
      },
      onSettled: () => {
        organisationContext.getAllOrganisationMemberships.invalidate({
          organisationId: props.params.orgId,
          teamId: props.params.orgTeamId
        })
        organisationTeamDetailsQuery.refetch()
      }
    })
  }

  if (organisationTeamDetailsQuery.isLoading) return <Typography>Loading...</Typography>
  if (organisationTeamDetailsQuery.isError) {
    toast.error(organisationTeamDetailsQuery.error.message)
    router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.HOME(props.params.orgId))
  }

  if (isEmpty(organisationTeamDetailsQuery.data)) return <Typography>Team not found</Typography>

  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  }}>
    <Typography variant="h5">Team Details</Typography>

    <TeamDisplayName
      orgId={props.params.orgId}
      teamId={props.params.orgTeamId}
      teamName={organisationTeamDetailsQuery.data.orgTeam.name}
    />
    <AddOrgTeamMemberDialog
      open={openAddOrgTeamMemberDialog}
      setOpen={setOpenAddOrgTeamMemberDialog}
      teamId={props.params.orgTeamId}
      orgId={props.params.orgId}
    />

    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignContent: 'center',
        mb: '0.5rem'
      }}>
        <Typography variant="h6">Team Members</Typography>
        <Button variant="contained" onClick={() => setOpenAddOrgTeamMemberDialog(true)}>Add Members</Button>
      </Box>

      {isEmpty(organisationTeamDetailsQuery.data.orgTeamMembers) ? <>
        <Typography>No members</Typography>
      </> :
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Joined At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organisationTeamDetailsQuery.data.orgTeamMembers.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.joinedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton aria-label="delete" onClick={() => handleRemoveTeamMember({ memberId: row.membershipId, teamId: props.params.orgTeamId })}>
                      <CloseIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      }
    </Box>
  </Box>
}

const schema = z.object({
  name: z.string().min(1, { message: "Team name is required" }),
});
type Schema = z.infer<typeof schema>;

const TeamDisplayName = (props: { teamName: RouterOutputs['organisation']['getAOrganisationTeam']['orgTeam']['name'], teamId: string, orgId: string }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      name: props.teamName,
    },
  });

  const updateTeamMutation = api.organisation.updateAOrganisationTeam.useMutation();
  const organisationContext = api.useUtils().organisation;

  const handleUpdateTeam = () => handleSubmit(data => {
    updateTeamMutation.mutate({ orgTeamId: props.teamId, name: data.name }, {
      onSuccess: () => {
        toast.success("Team updated successfully");
        organisationContext.getAOrganisationTeam.invalidate({ organisationId: props.orgId });
      },
      onError: (data) => {
        toast.error(`Error updating team: ${data.message}`);
      }
    });
  })()

  return <Box>
    <Typography variant="h6">Display Name</Typography>
    <Controller
      name="name"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          autoFocus
          margin="dense"
          type="text"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          sx={{
            mb: '0.5rem'
          }}
        />
      )}
    />
    <Button variant="contained" onClick={handleUpdateTeam} color="primary"
      type="submit"
      disabled={!isValid || updateTeamMutation.isPending || watch('name') === props.teamName}
    >
      Rename
    </Button>
  </Box>
}