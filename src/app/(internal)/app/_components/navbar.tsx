'use client';

import { Box, AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "~/utils/route-paths";

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
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          News
        </Typography>
        <Button onClick={handleLogout} color="inherit">Logout</Button>
      </Toolbar>
    </AppBar>
  </Box>
}