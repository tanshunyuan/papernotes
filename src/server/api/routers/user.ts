import { userRepository } from "~/server/domains/user-management/repo";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { User, USER_ROLE_ENUM, UserRoleEnum } from "~/server/domains/user-management/models/user";
import { uuid } from 'uuidv4';
import { clerkClient } from "@clerk/nextjs/server";


export const userRouter = createTRPCRouter({
  register: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth.userId
    const existingUser = await userRepository.getUserByIdOrNull(userId)

    if (existingUser) return null

    const clerkUser = await clerkClient.users.getUser(userId)

    const user = new User({
      id: uuid(),
      email: clerkUser.primaryEmailAddress?.emailAddress,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      role: USER_ROLE_ENUM.MEMBER
    })

    await userRepository.save(user)
    return 
  })
})