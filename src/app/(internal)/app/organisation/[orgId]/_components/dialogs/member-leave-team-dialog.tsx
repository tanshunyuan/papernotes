/* eslint-disable @typescript-eslint/no-floating-promises */
import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";

type MemberLeaveTeamDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  orgId: string,
  teamId: string
};

export const MemberLeaveTeamDialog = (props: MemberLeaveTeamDialogProps) => {
  const { open, setOpen, orgId, teamId } = props;

  const leaveTeamMutation = api.organisation.leaveOrganisationTeam.useMutation();
  const organisationContext = api.useUtils().organisation

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    leaveTeamMutation.mutate({
      orgId,
      teamId
    }, {
      onSuccess: () => {
        organisationContext.getOrganisationDetails.invalidate()
        handleClose()
      }, 
      onError: () => {
        toast.error('oh no something went wrong')
      }
    })
    handleClose();
  };

  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "0.75rem",
          maxWidth: "31.25rem",
          width: "100%",
        },
      }}
      open={open}
      aria-labelledby="leave-organization-dialog-title"
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.125rem",
          p: "1.25rem",
          display: "flex",
          alignItems: "center",
        }}
        id="leave-organization-dialog-title"
      >
        Leave Team
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            p: 0,
            ml: "auto",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ mx: "1.25rem" }} />
      <DialogContent sx={{ p: "1.25rem" }}>
        <Typography>
          Are you sure you want to leave this organization? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          sx={{
            color: "#313033",
            fontSize: "0.875rem",
          }}
        >
          Cancel
        </Button>
        <Button
          sx={{
            fontSize: "0.875rem",
            paddingInline: "1.75rem",
          }}
          color="error"
          variant="contained"
          onClick={handleConfirm}
        >
          Leave
        </Button>
      </DialogActions>
    </Dialog>
  );
};
