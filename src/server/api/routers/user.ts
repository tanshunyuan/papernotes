import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  register: protectedProcedure.query(async ({ ctx }) => {
    return ctx

  })
})