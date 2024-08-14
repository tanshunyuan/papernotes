'use client';

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import React from "react";
import * as zod from "zod";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "~/utils/route-paths";

const schema = zod.object({
  name: zod.string().min(1, { message: "Team name is required" }),
});

type Schema = zod.infer<typeof schema>;

type CreateOrganisationTeamPageProps = {
  params: {
    orgId: string
  }
};
export default function CreateOrganisationTeamPage(props: CreateOrganisationTeamPageProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      name: "",
    },
  });
  const router = useRouter()

  const organisationContext = api.useUtils().organisation;
  const teamCreateMutation = api.organisation.createAOrganisationTeam.useMutation();

  const handleCreateTeam = (data: Schema) => {
    teamCreateMutation.mutate(
      {
        name: data.name,
        organisationId: props.params.orgId
      },
      {
        onSuccess: () => {
          toast.success("Team created successfully");
          reset();
          router.push(ROUTE_PATHS.APP.ORGANISATION.TEAMS.HOME(props.params.orgId))
          organisationContext.getAllOrganisationTeams.invalidate();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleCreateTeam)} sx={{ mt: 2 }}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Team Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            sx={{ mb: 2 }}
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!isValid || teamCreateMutation.isPending}
      >
        Create
      </Button>
    </Box>
  );
};
