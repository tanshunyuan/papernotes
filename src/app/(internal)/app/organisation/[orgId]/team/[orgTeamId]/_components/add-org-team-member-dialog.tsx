import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { api } from "~/trpc/react";
import { Box, Button } from "@mui/material";
import toast from "react-hot-toast";

type AddOrgTeamMemberDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  teamId: string;
  orgId: string
};

export const AddOrgTeamMemberDialog = (props: AddOrgTeamMemberDialogProps) => {
  const { open, setOpen } = props;

  const getAllOrganisationMembershipsQuery = api.organisation.getAllOrganisationMemberships.useQuery({
    teamId: props.teamId,
    organisationId: props.orgId
  });

  const assignMembershipToTeamMutation = api.organisation.assignUserToTeam.useMutation();
  const organisationContext = api.useUtils().organisation;

  const onClose = () => {
    setOpen(false);
  };

  const handleAssignUserToATeam = (memberId: string) => {
    assignMembershipToTeamMutation.mutate({
      teamId: props.teamId,
      organisationId: props.orgId,
      memberId
    }, {
      onSuccess: () => {
        toast.success("User assigned to team successfully");
      }, onError: () => {
        toast.error("Error assigning user to team");
      },
      onSettled() {
        organisationContext.getAOrganisationTeam.invalidate();
        organisationContext.getAllOrganisationMemberships.invalidate()
        onClose()
      },
    })
  }

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
      onClose={onClose}
      aria-labelledby="org-team-users-dialog-title"
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.125rem",
          p: "1.25rem",
          display: "flex",
          alignItems: "center",
        }}
        id="org-team-users-dialog-title"
      >
        Organisation Team Members
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
        {getAllOrganisationMembershipsQuery.isLoading ? (
          <Box>Loading...</Box>
        ) : (
          <List>
            {getAllOrganisationMembershipsQuery.data?.map((user) => (
              <ListItem key={user.id}>
                <ListItemText primary={user.name} secondary={user.email} />
                <Button onClick={() => handleAssignUserToATeam(user.id)}>Assign</Button>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
