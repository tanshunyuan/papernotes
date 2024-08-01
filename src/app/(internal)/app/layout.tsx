import { Box } from "@mui/material";
import { BaseChildrenProps } from "~/types/common";
import { AppNavbar } from "./_components/navbar";

export default function AppLayout(props: BaseChildrenProps) {
  const { children } = props;
  return <Box>
    <AppNavbar />
    <Box sx={{
      p: '1rem'
    }}>
      {children}
    </Box>
  </Box>
}