/* eslint-disable @typescript-eslint/no-floating-promises */
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTitle, IconButton, Divider, DialogContent, InputLabel, TextField, DialogActions, Button, Box, FormHelperText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { DatePicker, DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface CreateOrganisationDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// @ts-expect-error some stupid error
const dayjsDate = z.custom((val:string) => {
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
})

type Schema = z.infer<typeof schema>;

export const CreateOrganisationDialog = (props: CreateOrganisationDialogProps) => {
  const { open, setOpen } = props;
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
          maxSeats: data.maxSeats
        },
        {
          onSuccess: () => {
            toast.success("Organisation created successfully");
            onClose()
          },
          onError: (error) => {
            toast.error(error.message);
          },
          onSettled: () => {
            organisationContext.getAllOrganisations.invalidate()
          }
        },
      );
    })();

  const onClose = () => {
    reset();
    setOpen(false);
  };


  return <>
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "0.75rem",
          maxWidth: "31.25rem",
          width: "100%",
        },
      }}
      disableRestoreFocus
      open={open}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.125rem",
          p: "1.25rem",
          display: "flex",
          alignItems: "center",
        }}
        id="form-dialog-title"
      >
        Create new project
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            p: 0,
            ml: "auto",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ mx: "1.25rem" }} />
      <DialogContent
        sx={{
          p: "1.25rem",
        }}
      >
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
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#313033",
                  "& .MuiFormLabel-asterisk": {
                    color: "#B3261E",
                  },
                }}
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
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#313033",
                    "& .MuiFormLabel-asterisk": {
                      color: "#B3261E",
                    },
                  }}
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
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#313033",
                    "& .MuiFormLabel-asterisk": {
                      color: "#B3261E",
                    },
                  }}
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

        <DialogActions>
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
            disabled={organisationCreateMutation.isPending || organisationCreateMutation.isSuccess}
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            onClick={handleCreateOrganisation}
          >
            Create
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  </>
}