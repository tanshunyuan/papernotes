/* eslint-disable @typescript-eslint/no-floating-promises */
import { Box, Button, InputLabel, TextField, Typography } from "@mui/material"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { RouterOutputs } from "~/trpc/shared";

type UpsertOrgResourcesFormProps = {
  orgId: string
  resourceLimits: RouterOutputs['organisation']['getOrganisationDetails']['resourceLimits']
}

const schema = z.object({
  projectLimit: z.coerce.number().min(1, { message: "Project limit must be at least 1" }),
  projectResetDuration: z.coerce.number().min(1, { message: "Project reset duration must be at least 1 day" }),
  featureLimit: z.coerce.number().min(1, { message: "Feature limit must be at least 1" }),
});

type Schema = z.infer<typeof schema>;

export const UpsertOrgResourcesForm = (props: UpsertOrgResourcesFormProps) => {
  const { orgId, resourceLimits } = props
  const [editResourceLimit, setEditResourceLimit] = useState(false);

  const organisationContext = api.useUtils().organisation;
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      projectLimit: resourceLimits?.configuration.resources.project.limit ?? 0,
      projectResetDuration: resourceLimits?.configuration.resources.project.reset_duration_days ?? 0,
      featureLimit: resourceLimits?.configuration.resources.feature.limit ?? 0,
    },
  });

  const updateOrgResourcesMutation = api.organisation.upsertOrganisationResourceLimits.useMutation();

  const handleUpdateOrgResources = () => {
    handleSubmit(async (data) => {
      updateOrgResourcesMutation.mutate({
        orgId,
        projectLimit: data.projectLimit,
        projectResetDuration: data.projectResetDuration,
        featureLimit: data.featureLimit,
      },
        {
          onSuccess: () => {
            toast.success("Organisation resources updated successfully");
          },
          onError: (error) => {
            toast.error(error.message);
          },
          onSettled: () => {
            organisationContext.getOrganisationDetails.invalidate()
            onClose()
          }
        },
      )
    })();
  }

  const onClose = () => {
    reset();
    setEditResourceLimit(false)
  };

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <Typography variant="h6">Organisation Resource Limits</Typography>
        <Box>
          {!editResourceLimit ?
            <Button onClick={() => setEditResourceLimit(prev => !prev)}>Edit Resource Limit</Button> :
            <>
              <Button onClick={() => setEditResourceLimit(prev => !prev)}>Cancel</Button>
              <Button onClick={handleUpdateOrgResources}>Save</Button>
            </>
          }
        </Box>
      </Box>

      {
        !editResourceLimit ?
          <Box sx={{
            display: 'flex',
            gap: '2rem'
          }}>
            <Box>
              <Typography>Project Limit: {resourceLimits?.configuration.resources.project.limit}</Typography>
              <Typography>Project Reset Duration: {resourceLimits?.configuration.resources.project.reset_duration_days}</Typography>
            </Box>
            <Box>
              <Typography>Feature Limit: {resourceLimits?.configuration.resources.feature.limit}</Typography>
            </Box>
          </Box> :
          <>
            <Controller
              name="projectLimit"
              control={control}
              render={({ field }) => (
                <>
                  <InputLabel error={!!errors.projectLimit} required>
                    Project Limit
                  </InputLabel>
                  <TextField
                    {...field}
                    type="number"
                    sx={{
                      marginTop: "0.5rem",
                      marginBottom: "1.5rem",
                    }}
                    fullWidth
                    variant="outlined"
                    error={!!errors.projectLimit}
                    helperText={errors.projectLimit ? errors.projectLimit.message : ""}
                    required
                  />
                </>
              )}
            />
            <Controller
              name="projectResetDuration"
              control={control}
              render={({ field }) => (
                <>
                  <InputLabel error={!!errors.projectResetDuration} required>
                    Project Reset Duration (days)
                  </InputLabel>
                  <TextField
                    {...field}
                    type="number"
                    sx={{
                      marginTop: "0.5rem",
                      marginBottom: "1.5rem",
                    }}
                    fullWidth
                    variant="outlined"
                    error={!!errors.projectResetDuration}
                    helperText={errors.projectResetDuration ? errors.projectResetDuration.message : ""}
                    required
                  />
                </>
              )}
            />
            <Controller
              name="featureLimit"
              control={control}
              render={({ field }) => (
                <>
                  <InputLabel error={!!errors.featureLimit} required>
                    Feature Limit
                  </InputLabel>
                  <TextField
                    {...field}
                    type="number"
                    sx={{
                      marginTop: "0.5rem",
                      marginBottom: "1.5rem",
                    }}
                    fullWidth
                    variant="outlined"
                    error={!!errors.featureLimit}
                    helperText={errors.featureLimit ? errors.featureLimit.message : ""}
                    required
                  />
                </>
              )}
            />
            <Box>
              <Button
                onClick={onClose}
                sx={{
                  color: "#313033",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
                size="large"
              >
                Cancel
              </Button>
              <Button
                sx={{
                  fontSize: "0.875rem",
                  paddingInline: "1.75rem",
                }}
                disabled={!isValid || updateOrgResourcesMutation.isPending}
                type="submit"
                color="primary"
                variant="contained"
                size="large"
                onClick={handleUpdateOrgResources}
              >
                Update
              </Button>
            </Box>
          </>
      }
    </Box>

  )
}
