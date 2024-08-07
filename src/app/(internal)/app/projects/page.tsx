/* eslint-disable @typescript-eslint/no-floating-promises */
'use client';

import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { useSeedNewUser } from "~/hooks/use-seed-user";
import { api } from "~/trpc/react";
import isEmpty from 'lodash/isEmpty'
import React, { useState } from "react";
import { CreateProjectDialog } from "./_components/dialogs/create-project-dialog";
import { RouterOutputs } from "~/trpc/shared";
import { UpdateProjectDialog } from "./_components/dialogs/update-project-dialog";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "~/utils/route-paths";

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
          gap: '1rem',
        }}
      >
        {getProjectsQuery.data?.map(project => (<ProjectCard key={project.id} project={project} />))}
      </Box>

    </Box>}
  </Box>
}


interface ProjectCardProps {
  project: RouterOutputs['project']['getProjectsByUserId'][number];
}
const ProjectCard = (props: ProjectCardProps) => {
  const { project } = props;
  const [openUpdateProjectDialog, setOpenUpdateProjectDialog] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter()

  const deleteProjectMutation = api.project.deleteAProject.useMutation();
  const projectContext = api.useUtils().project;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateProject = () => {
    setOpenUpdateProjectDialog(true)
    handleClose()
  }

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate({
      id: project.id
    }, {
      onSuccess: () => {
        toast.success("Project deleted successfully")
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        projectContext.getProjectsByUserId.invalidate()
        handleClose()
      }
    })
  }

  const handleViewProjectDetails = () => {
    router.push(ROUTE_PATHS.APP.PROJECT.DETAILS(project.id))
  }

  return (
    <>
      <UpdateProjectDialog
        open={openUpdateProjectDialog}
        setOpen={setOpenUpdateProjectDialog}
        project={project}
      />

      <Box
        sx={{
          border: '1px solid #313033',
          padding: '1rem',
          width: 'max-content',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',

        }}
        key={project.id}>
        <Typography variant="h4">{project.name}</Typography>
        <Typography variant="body1">{project.description}</Typography>
        <Button variant="contained" onClick={handleClick}>More</Button>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >

          <MenuItem onClick={handleViewProjectDetails}>View Details</MenuItem>
          {project.permissions?.includes('project:update') ?
            <MenuItem onClick={handleUpdateProject}>Update</MenuItem> : null
          }

          {
            project.permissions?.includes('project:delete') ?
              <MenuItem sx={{ color: 'red' }} onClick={handleDeleteProject}>Delete</MenuItem> : null
          }
        </Menu>
      </Box>
    </>
  )
}