'use client';

import { Box, AppBar, Toolbar, IconButton, Typography, Button, Skeleton } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "~/utils/route-paths";
import Link from "next/link";
import { api } from "~/trpc/react";
import { USER_PLAN_ENUM } from "~/server/domains/user-management/models/user";

export const AppNavbar = () => {
  const { signOut } = useClerk()
  const router = useRouter()

  const userQuery = api.user.getUserDetails.useQuery()

  const handleLogout = async () => {
    await signOut(() => {
      router.push(`${ROUTE_PATHS.SIGNIN}`)
    })
  }

  if (userQuery.isLoading) return <Skeleton variant="rectangular" width={210} height={118} />

  return <Box>
    <AppBar position="static">
      <Toolbar sx={{
        display: 'flex',
        justifyContent: 'space-between',
      }}>

        <Box sx={{
          display: 'inline-flex',
          gap: '1rem'
        }}>
          <Typography>
            <Link href={ROUTE_PATHS.APP.PROJECT.HOME}>
              Project
            </Link>
          </Typography>


          {userQuery.data?.email.includes('@gignite') ?
            <Typography>
              <Link href={ROUTE_PATHS.APP.TOOLS.HOME}>
                Tools
              </Link>
            </Typography> : null
          }

          {
            userQuery.data?.plan === USER_PLAN_ENUM.ENTERPRISE ?
              <Typography>
                <Link href={ROUTE_PATHS.APP.ORGANISATION.HOME}>
                  Organisation
                </Link>
              </Typography> : null
          }
        </Box>

        <Box>
          <Typography>Welcome {userQuery.data?.email}. You&apos;re on {userQuery.data?.plan}</Typography>
        </Box>

        <Box>
          <Button onClick={handleLogout} color="inherit">Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  </Box>
}