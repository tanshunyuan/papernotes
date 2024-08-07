import { userRepository } from "~/server/domains/user-management/repo";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { User, USER_PLAN_ENUM } from "~/server/domains/user-management/models/user";
import { uuid } from 'uuidv4';
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCClientError } from "@trpc/client";


export const userRouter = createTRPCRouter({
  register: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth.userId
    try {

      const existingUser = await userRepository.getUserByIdOrNull(userId)

      if (existingUser) return null

      const clerkUser = await clerkClient.users.getUser(userId)

      const user = new User({
        id: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        /**@todo learn how to hide this in the class */
        plan: USER_PLAN_ENUM.FREE
      })

      await userRepository.save(user)
      return
    } catch (e) {
      const error = e as Error
      throw new TRPCClientError(error.message)
    }
  }),

  getUserDetails: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId
    try {
      const user = await userRepository.getUserByIdOrNull(userId)
      if (!user) throw new Error('User not found')

      return {
        email: user.getValue().email,
        name: user.getValue().name,
        plan: user.getValue().plan
      }

    } catch (error) {
      const errorMessage = error as Error
      throw new TRPCClientError(errorMessage.message)
    }
  })
})