'use client'
import { Inter } from "next/font/google";
import { ErrorBoundary } from "react-error-boundary";

import { TRPCReactProvider } from "~/trpc/react";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

import "~/styles/globals.css";
import { type BaseChildrenProps } from "~/types/common";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// export const metadata = {
//   title: "Create T3 App",
//   description: "Generated by create-t3-app",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// };

export default function RootLayout(props: BaseChildrenProps) {
  const { children } = props;
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <html lang="en">
        <body className={`font-sans ${inter.variable}`}>
          <ClerkProvider
            signInFallbackRedirectUrl={'/app/projects'}
            signUpFallbackRedirectUrl={'/app/projects'}
          >
            <AppRouterCacheProvider>
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </AppRouterCacheProvider>
          </ClerkProvider>
        </body>
      </html>
    </ErrorBoundary>
  );
}
