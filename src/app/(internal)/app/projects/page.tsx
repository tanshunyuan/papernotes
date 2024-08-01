'use client';

import { Box, Button, Typography } from "@mui/material";
import { useSeedNewUser } from "~/hooks/use-seed-user";
import { api } from "~/trpc/react";
import isEmpty from 'lodash/isEmpty'
import { useState } from "react";
import { CreateProjectDialog } from "./_components/dialogs/create-project-dialog";

export default function ProjectsPage() {
  const [openProjectDialog, setOpenProjectDialog] = useState(false);

  const getProjectsQuery = api.project.getProjectsByUserId.useQuery();
  const isProjectsEmpty = isEmpty(getProjectsQuery.data)

  const handleCreateProject = () => {
    setOpenProjectDialog(true)
  }


  useSeedNewUser();

  if (getProjectsQuery.isLoading) {
    return <div>Loading...</div>
  }



  return <Box>
    <CreateProjectDialog
      open={openProjectDialog}
      setOpen={setOpenProjectDialog}
    />

    {isProjectsEmpty ? <Box>
      <Typography variant="h4">No projects found</Typography>
      <Button onClick={handleCreateProject}>Create</Button>
    </Box> : <Box sx={{
      display: "flex",
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <Button onClick={handleCreateProject}>Create</Button>
      <Box
        sx={{
          display: "flex",
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {getProjectsQuery.data?.map(project => (<Box
          sx={{
            border: '1px solid #313033',
            padding: '1rem',
            width: 'max-content',
            borderRadius: '0.5rem'
          }}
          key={project.id}>
          <Typography variant="h4">{project.name}</Typography>
          <Typography variant="body1">{project.description}</Typography>
        </Box>))}
      </Box>

    </Box>}
  </Box>
}