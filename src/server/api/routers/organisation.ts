import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { organisationManagementService } from "~/server/domains/organisation-management/services";
import { z } from "zod";

const createOrganisationValidator = z.object({
  name: z.string(),
  description: z.string(),
  planDurationStart: z.date(),
  planDurationEnd: z.date(),
  maxSeats: z.number()
})

export const organisationRouter = createTRPCRouter({
  createOrganisation: protectedProcedure.input(createOrganisationValidator).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.auth.userId
      await organisationManagementService.createOrganisation({
        userId,
        name: input.name,
        description: input.description,
        planDurationStart: input.planDurationStart,
        planDurationEnd: input.planDurationEnd,
        maxSeats: input.maxSeats
      })
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  }),

  getAllOrganisations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.auth.userId
      const organisations = await organisationManagementService.getAllOrganisations(userId)
      return organisations
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  })

})