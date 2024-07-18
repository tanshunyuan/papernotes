"use client";

import Box from "@mui/material/Box";
import { type BaseChildrenProps } from "~/types/common";

export default function AuthenticationLayout(props: BaseChildrenProps) {
  const { children } = props;

  return (
    <Box
      component={"main"}
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Box>
  );
}
