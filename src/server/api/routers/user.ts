import { userRepository } from "~/server/domains/user-management/repo";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";
import { userService } from "~/server/domains/user-management/services";


export const userRouter = createTRPCRouter({
  register: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth.userId
    try {
      await userService.registerExistingClerkUser(userId)
    } catch (e) {
      const error = e as Error
      throw new TRPCClientError(error.message)
    }
  }),

  getUserDetails: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId
    try {
      const result = await userService.getUserDetails(userId)
      console.log('getUserDetails.result', result)
      return result
    } catch (error) {
      const errorMessage = error as Error
      throw new TRPCClientError(errorMessage.message)
    }
  }),

  getUserResourceLimits: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId
    try {
      const resourceLimits = await userService.getUserResourceLimits(userId)
      return resourceLimits
    } catch (error) {
      const errorMessage = error as Error
      throw new TRPCClientError(errorMessage.message)
    }
  })
})