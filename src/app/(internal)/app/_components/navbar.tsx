'use client';

import { Box, AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "~/utils/route-paths";
import Link from "next/link";

export const AppNavbar = () => {
  const { signOut } = useClerk()
  const router = useRouter()
  const handleLogout = async () => {
    await signOut(() => {
      router.push(`${ROUTE_PATHS.SIGNIN}`)
    })
  }
  return <Box sx={{ flexGrow: 1 }}>
    <AppBar position="static">
      <Toolbar>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link href={ROUTE_PATHS.APP.PROJECT_HOME}>
            Project
          </Link>
        </Typography>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link href={ROUTE_PATHS.APP.TOOLS}>
            Tools
          </Link>
        </Typography>

        <Button onClick={handleLogout} color="inherit">Logout</Button>
      </Toolbar>
    </AppBar>
  </Box>
}