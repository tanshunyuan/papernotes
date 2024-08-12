/* eslint-disable @typescript-eslint/no-floating-promises */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form"
import { isValid, z } from "zod"
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

type UpdateOrgUserDialogProps = {
  orgUserId: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const schema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

type Schema = z.infer<typeof schema>;

export const UpdateOrgUserDialog = (props: UpdateOrgUserDialogProps) => {
  const { open, setOpen, orgUserId } = props

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
      role: 'MEMBER',
    },
  });

  const updateOrganisationUserRoleMutation = api.organisation.updateOrganisationUserRole.useMutation();

  const handleUpdateOrgUser = () => {
    handleSubmit(async (data) => {
      updateOrganisationUserRoleMutation.mutate({
        organisationUserId: orgUserId,
        role: data.role,
      },
        {
          onSuccess: () => {
            toast.success("Update Organisation User Role Successfully");
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
      Update Organisation User Role ({orgUserId})
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
        name="role"
        control={control}
        render={({ field }) => (
          <>
            <InputLabel error={!!errors.role} required>
              Role
            </InputLabel>
            <Select
              {...field}
              fullWidth
              error={!!errors.role}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MEMBER">Member</MenuItem>
            </Select>
            {errors.role && <FormHelperText error>{errors.role.message}</FormHelperText>}
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
          disabled={!isValid || updateOrganisationUserRoleMutation.isPending || updateOrganisationUserRoleMutation.isSuccess}
          type="submit"
          color="primary"
          variant="contained"
          size="large"
          onClick={handleUpdateOrgUser}
        >
          Update
        </Button>
      </DialogActions>
    </DialogContent>
  </Dialog>
}