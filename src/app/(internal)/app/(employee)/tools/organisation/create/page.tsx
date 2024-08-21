'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Divider, FormHelperText, InputLabel, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "~/trpc/react";
import { ROUTE_PATHS } from "~/utils/route-paths";

// @ts-expect-error some stupid error
const dayjsDate = z.custom((val: string) => {
  return dayjs(val).isValid();
}, {
  message: "Invalid date format"
});

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  startDate: dayjsDate,
  endDate: dayjsDate,
  maxSeats: z.coerce.number().min(1, { message: "Max seats is required" }),
  projectLimit: z.coerce.number().min(1, { message: "Project limit must be at least 1" }),
  projectResetDuration: z.coerce.number().min(1, { message: "Project reset duration must be at least 1 day" }),
  featureLimit: z.coerce.number().min(1, { message: "Feature limit must be at least 1" }),
})

type Schema = z.infer<typeof schema>;
export default function CreateOrganisationPage() {
  const router = useRouter()
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
      description: "",
      name: "",
      startDate: dayjs(),
      endDate: dayjs(),
      maxSeats: 1,
      projectLimit: 0,
      projectResetDuration: 30,
      featureLimit: 0,
    },
  });

  const organisationCreateMutation = api.organisation.createOrganisation.useMutation();

  const handleCreateOrganisation = () =>
    handleSubmit((data) => {
      organisationCreateMutation.mutate(
        {
          description: data.description,
          name: data.name,
          //@ts-expect-error some date error
          planDurationStart: dayjs(data.startDate).toDate(),
          //@ts-expect-error some date error
          planDurationEnd: dayjs(data.endDate).toDate(),
          maxSeats: data.maxSeats,
          resourceLimits: {
            projectLimit: data.projectLimit,
            projectResetDuration: data.projectResetDuration,
            featureLimit: data.featureLimit
          }
        },
        {
          onSuccess: () => {
            toast.success("Organisation created successfully");
          },
          onError: (error) => {
            toast.error(error.message);
          },
          onSettled: () => {
            organisationContext.getAllOrganisations.invalidate()
            onFinish()
          }
        },
      );
    })();

  const onFinish = () => {
    router.push(ROUTE_PATHS.APP.TOOLS.HOME)
    reset();
  };


  return <Box
    sx={{
      mx: '1.25rem'
    }}
  >
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: 'center'
      }}>
        <Typography>
          Create an organisation
        </Typography>
        <Box>
          <Button
            onClick={onFinish}
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
            disabled={organisationCreateMutation.isPending }
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            onClick={handleCreateOrganisation}
          >
            Create
          </Button>
        </Box>
      </Box>
      <Divider sx={{ my: '1rem' }} />
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel error={!!errors.name} required>
              Name
            </InputLabel>
            <TextField
              {...field}
              ref={field.ref}
              sx={{
                marginTop: "0.5rem",
                marginBottom: "1.5rem",
              }}
              autoFocus
              fullWidth
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name ? errors.name.message : ""}
              required
            />
          </>
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel
              error={!!errors.description}
              required
            >
              Description
            </InputLabel>
            <TextField
              {...field}
              sx={{
                marginTop: "0.5rem",
                marginBottom: "1.5rem",
              }}
              inputProps={{
                style: {
                  padding: "0",
                },
              }}
              id="description"
              type="text"
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={
                errors.description ? errors.description.message : ""
              }
              required
            />
          </>
        )}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Controller
          name="startDate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              <InputLabel
                error={!!errors.startDate}
                required
              >
                Start Date
              </InputLabel>

              {/* @ts-expect-error some date error */}
              <DatePicker value={field.value}
                inputRef={field.ref}
                onChange={(date) => {
                  field.onChange(date);
                }}
              />
              {errors.startDate && (
                <FormHelperText error>{errors.startDate.message}</FormHelperText>
              )}
            </>
          )}
        />

        <Controller
          name="endDate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              <InputLabel
                error={!!errors.endDate}
                required
              >
                End Date
              </InputLabel>
              {/* @ts-expect-error some date error */}
              <DatePicker value={field.value}
                inputRef={field.ref}
                onChange={(date) => {
                  field.onChange(date);
                }}
              />
              {errors.endDate && (
                <FormHelperText error>{errors.endDate.message}</FormHelperText>
              )}
            </>
          )}
        />
      </Box>

      <Controller
        name="maxSeats"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel error={!!errors.maxSeats} required>
              Max Seats
            </InputLabel>
            <TextField
              {...field}
              ref={field.ref}
              sx={{
                marginTop: "0.5rem",
                marginBottom: "1.5rem",
              }}
              type="number"
              autoFocus
              fullWidth
              variant="outlined"
              error={!!errors.maxSeats}
              helperText={errors.maxSeats ? errors.maxSeats.message : ""}
              required
            />
          </>
        )}
      />

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


    </LocalizationProvider>
  </Box>
}