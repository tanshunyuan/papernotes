'use client';

import { Box, Typography } from "@mui/material";
import { api } from "~/trpc/react";

interface ProjectDetailsPageProps {
  params: {
    projectId: string;
  }
}

export default function ProjectDetailsPage(props: ProjectDetailsPageProps) {
  const { params } = props;
  const projectId = params.projectId
  const getProjectQuery = api.project.getAProjectById.useQuery({ projectId });
  if (getProjectQuery.isLoading) {
    return <div>Loading...</div>
  }
  return <Box>
    <Typography variant="h4">{getProjectQuery.data?.name}</Typography>
    <Typography variant="body1">{getProjectQuery.data?.description}</Typography>
  </Box>
}