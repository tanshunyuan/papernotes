'use client';

import { Box, AppBar, Toolbar, Typography, Button, Skeleton, Breadcrumbs, Link as MuiLink } from "@mui/material"
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

  const isPartOfOrganisation = userQuery.data?.plan === USER_PLAN_ENUM.ENTERPRISE && userQuery.data.organisation

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


          {userQuery.data?.email.includes('@employee') ?
            <Typography>
              <Link href={ROUTE_PATHS.APP.TOOLS.HOME}>
                Tools
              </Link>
            </Typography> : null
          }

          {isPartOfOrganisation ?
            <Typography>
              <Link href={ROUTE_PATHS.APP.ORGANISATION.HOME(userQuery.data!.organisation!.id)}>
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

    {isPartOfOrganisation ?
      <Breadcrumbs aria-label="breadcrumb" sx={{ px: '1rem', py: '0.5rem' }}>
        <MuiLink underline="hover" color="inherit" href={ROUTE_PATHS.APP.PROJECT.HOME}>
          {userQuery.data?.organisation?.name}
        </MuiLink>
        {
          userQuery.data?.organisation?.teamName ?
            <Typography>
              {userQuery.data.organisation.teamName}
            </Typography> : null
        }
      </Breadcrumbs> : null
    }
  </Box>
}