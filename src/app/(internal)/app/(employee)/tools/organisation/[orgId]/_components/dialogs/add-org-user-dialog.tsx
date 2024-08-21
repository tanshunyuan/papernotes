/* eslint-disable @typescript-eslint/no-floating-promises */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form"
import { isValid, z } from "zod"
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { MEMBERSHIP_ROLE_ENUM } from "~/server/domains/organisation-management/models/membership";

type AddOrgUserDialogProps = {
  orgId: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const schema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, {
    message: "Last name is required",
  }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  memberType: z.nativeEnum(MEMBERSHIP_ROLE_ENUM)
});

type Schema = z.infer<typeof schema>;

export const AddOrgUserDialog = (props: AddOrgUserDialogProps) => {
  const { open, setOpen, orgId } = props

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
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      memberType: MEMBERSHIP_ROLE_ENUM.MEMBER
    },
  });

  const addUserToOrganisationMutation = api.organisation.addUserToOrganisation.useMutation();

  const handleAddOrgUser = () => {
    handleSubmit(async (data) => {
      addUserToOrganisationMutation.mutate({
        organisationId: orgId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        memberType: data.memberType
      },
        {
          onSuccess: () => {
            toast.success("User added successfully");
          },
          onError: (error) => {
            toast.error(error.message);
          },
          onSettled: () => {
            organisationContext.getOrganisationDetails.invalidate({
              organisationId: orgId
            })
            onClose()
          }
        },
      )
    })();
  }

  const onClose = () => {
    reset();
    setOpen(false);
  };
  return <Dialog
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
      Add User to Organisation
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
        name="firstName"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel error={!!errors.firstName} required>
              First Name
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
              error={!!errors.firstName}
              helperText={errors.firstName ? errors.firstName.message : ""}
              required
            />
          </>
        )}
      />
      <Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel
              error={!!errors.lastName}
              required
            >
              Last Name
            </InputLabel>
            <TextField
              {...field}
              sx={{
                marginTop: "0.5rem",
                marginBottom: "1.5rem",
              }}
              id="lastName"
              type="text"
              fullWidth
              error={!!errors.lastName}
              helperText={
                errors.lastName ? errors.lastName.message : ""
              }
              required
            />
          </>
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel
              error={!!errors.email}
              required
            >
              Email
            </InputLabel>
            <TextField
              {...field}
              sx={{
                marginTop: "0.5rem",
                marginBottom: "1.5rem",
              }}
              id="email"
              type="text"
              fullWidth
              error={!!errors.email}
              helperText={
                errors.email ? errors.email.message : ""
              }
              required
            />
          </>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel
              error={!!errors.password}
              required
            >
              Password
            </InputLabel>
            <TextField
              {...field}
              sx={{
                marginTop: "0.5rem",
                marginBottom: "1.5rem",
              }}
              id="password"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={
                errors.password ? errors.password.message : ""
              }
              required
            />
          </>
        )}
      />
      <Controller
        name="memberType"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel error={!!errors.memberType} required>
              Member Type
            </InputLabel>
            <FormControl fullWidth sx={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
              <Select
                {...field}
                error={!!errors.memberType}
              >
                <MenuItem value={MEMBERSHIP_ROLE_ENUM.ADMIN}>Admin</MenuItem>
                <MenuItem value={MEMBERSHIP_ROLE_ENUM.MEMBER}>Member</MenuItem>
              </Select>
            </FormControl>
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
          disabled={!isValid || addUserToOrganisationMutation.isPending}
          type="submit"
          color="primary"
          variant="contained"
          size="large"
          onClick={handleAddOrgUser}
        >
          Create
        </Button>
      </DialogActions>
    </DialogContent>
  </Dialog>
}