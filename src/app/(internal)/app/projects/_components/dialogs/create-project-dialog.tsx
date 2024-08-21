/* eslint-disable @typescript-eslint/no-floating-promises */
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import InputLabel from "@mui/material/InputLabel";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";

// Zod schema for form validation
const schema = zod.object({
  name: zod.string().min(1, { message: "Name is required" }),
  description: zod.string().min(1, {
    message: "Description is required",
  }),
});

type Schema = zod.infer<typeof schema>;

type CreateProjectDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreateProjectDialog = (props: CreateProjectDialogProps) => {
  const { open, setOpen } = props;
  const projectContext = api.useUtils().project;

  const userQuery = api.user.getUserDetails.useQuery()

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
    },
  });

  const projectCreateMutation = api.project.create.useMutation();

  const handleCreateProject = () =>
    handleSubmit((data) => {
      projectCreateMutation.mutate(
        {
          teamId: userQuery.data?.organisation?.teamId ?? null,
          description: data.description,
          name: data.name,
        },
        {
          onSuccess: () => {
            toast.success("Project created successfully");
          },
          onError: (error) => {
            toast.error(error.message);
          },
          onSettled: () => {
            projectContext.getProjectsByUserId.invalidate()
            onClose()
          }
        },
      );
    })();

  const onClose = () => {
    reset();
    setOpen(false);
  };

  if(userQuery.isLoading) return <div>Loading...</div>

  return (
    <>
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
              disabled={!isValid || projectCreateMutation.isPending}
              type="submit"
              color="primary"
              variant="contained"
              size="large"
              onClick={handleCreateProject}
            >
              Create
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};
