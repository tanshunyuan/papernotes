/* eslint-disable @typescript-eslint/no-floating-promises */
'use client'

import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { api } from "~/trpc/react";
import isEmpty from 'lodash/isEmpty'
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "~/utils/route-paths";
import { useState } from "react";
import { RouterOutputs } from "~/trpc/shared";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

// view all the teams

interface OrganisationTeamPageProps {
  params: {
    orgId: string
    orgTeamId: string
  }
}
/**@deprecated not needed as teams are viewed on the organisation page */
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
      {organisationTeamQuery.data?.map((team) => (
        <TeamItem key={team.id} team={team} orgId={props.params.orgId} />
      ))}
    </Box>}
  </Box>
}

const schema = z.object({
  name: z.string().min(1, { message: "Team name is required" }),
});

type Schema = z.infer<typeof schema>;

interface TeamItemProps {
  team: RouterOutputs['organisation']['getAllOrganisationTeams'][number]
  orgId: string;
}

export const TeamItem = (props: TeamItemProps) => {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const router = useRouter();

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
      name: props.team.name,
    },
  });

  const updateTeamMutation = api.organisation.updateAOrganisationTeam.useMutation();

  const handleUpdateTeam = () => handleSubmit(data => {
    updateTeamMutation.mutate({ orgTeamId: props.team.id, name: data.name }, {
      onSuccess: () => {
        toast.success("Team updated successfully");
        setIsUpdateDialogOpen(false);
        // Invalidate and refetch
        api.useUtils().organisation.getAllOrganisationTeams.invalidate({ organisationId: props.orgId });
      },
      onError: (data) => {
        toast.error(`Error updating team: ${data.message}`);
      }
    });
  })()



  const onClose = () => {
    reset();
    setIsUpdateDialogOpen(false);
  };

  return (
    <Box key={props.team.id}>
      <Typography>{props.team.name}</Typography>
      <Button variant='contained' onClick={() => router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.DETAILS(props.orgId, props.team.id))}>More</Button>
      <Button onClick={() => setIsUpdateDialogOpen(true)}>Update</Button>

      <Dialog open={isUpdateDialogOpen} onClose={() => setIsUpdateDialogOpen(false)}>
        <DialogTitle>Update Team Name</DialogTitle>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label="New Team Name"
                type="text"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateTeam} color="primary"
            type="submit"
            disabled={!isValid || updateTeamMutation.isPending || watch('name') === props.team.name.trim()}
          >
            Update
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
