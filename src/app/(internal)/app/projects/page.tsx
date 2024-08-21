/* eslint-disable @typescript-eslint/no-floating-promises */
'use client';

import { Box, Button, LinearProgress, Menu, MenuItem, Typography } from "@mui/material";
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

  const getProjectsQuery = api.project.getUserProjects.useQuery();
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
    <ProjectLimits />
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
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '1rem'
        }}
      >
        {getProjectsQuery.data?.map(project => (<ProjectCard key={project.id} project={project} />))}
      </Box>
    </Box>}

  </Box>
}

const ProjectLimits = () => {
  const userResourceLimitsQuery = api.user.getUserResourceLimits.useQuery();
  if (userResourceLimitsQuery.isLoading) return <div>Loading...</div>

  const totalProjects = userResourceLimitsQuery.data?.resource.projects.quota;
  const usedSeats = userResourceLimitsQuery.data?.resource.projects.used;
  const progress = (usedSeats! / totalProjects!) * 100;

  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: '1rem',
        p: '1rem',
        width: '50%'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="subtitle1">Projects</Typography>
        <Typography variant="subtitle1">{usedSeats} of {totalProjects} projects used</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 10,
          borderRadius: '4px',
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#1976d2',
          },
        }}
      />
    </Box>
  );
}

interface ProjectCardProps {
  project: NonNullable<RouterOutputs['project']['getUserProjects']>[number];
}
const ProjectCard = (props: ProjectCardProps) => {
  const { project } = props;
  const [openUpdateProjectDialog, setOpenUpdateProjectDialog] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter()

  const deleteProjectMutation = api.project.deleteAProject.useMutation();
  const projectContext = api.useUtils().project;
  const userContext = api.useUtils().user

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
        projectContext.getUserProjects.invalidate()
        userContext.getUserResourceLimits.invalidate()
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
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',

        }}
        key={project.id}>
        <Typography variant="h5">{project.name}</Typography>
        <Typography variant="body1">{project.description}</Typography>
        <Typography variant="body2">Created By: {project.createdBy}</Typography>
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
            // @ts-expect-error ignore this
            project.permissions?.includes('project:delete') ?
              <MenuItem sx={{ color: 'red' }} onClick={handleDeleteProject}>Delete</MenuItem> : null
          }
        </Menu>
      </Box>
    </>
  )
}