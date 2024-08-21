import { Box } from "@mui/material";
import { type BaseChildrenProps } from "~/types/common";
import { AppNavbar } from "./_components/navbar";
import { Toaster } from "react-hot-toast";

export default function AppLayout(props: BaseChildrenProps) {
  const { children } = props;
  return <Box>
    <AppNavbar />
    <Box sx={{
      p: '1rem'
    }}>
      <Toaster />
      {children}
    </Box>
  </Box>
}