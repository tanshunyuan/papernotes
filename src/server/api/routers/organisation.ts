import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { organisationManagementService } from "~/server/domains/organisation-management/services";
import { z } from "zod";
import { ORGANISATION_ROLE_ENUM } from "~/server/domains/organisation-management/models/organisation-user";

const createOrganisationValidator = z.object({
  name: z.string(),
  description: z.string(),
  planDurationStart: z.date(),
  planDurationEnd: z.date(),
  maxSeats: z.number(),
  resourceLimits: z.object({
    projectLimit: z.number(),
    projectResetDuration: z.number(),
    featureLimit: z.number()
  })
})

const upsertOrganisationResourceLimitsValidator = z.object({
  orgId: z.string(),
  projectLimit: z.number(),
  projectResetDuration: z.number(),
  featureLimit: z.number()
})

export const organisationRouter = createTRPCRouter({
  createOrganisation: protectedProcedure.input(createOrganisationValidator).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.auth.userId
      await organisationManagementService.createOrganisation({
        currentUserId: userId,
        name: input.name,
        description: input.description,
        planDurationStart: input.planDurationStart,
        planDurationEnd: input.planDurationEnd,
        maxSeats: input.maxSeats,
        resourceLimits: {
          projectLimit: input.resourceLimits.projectLimit,
          projectResetDuration: input.resourceLimits.projectResetDuration,
          featureLimit: input.resourceLimits.featureLimit
        }
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
  }),

  getOrganisationDetails: protectedProcedure.input(z.object({
    organisationId: z.string()
  })).query(async ({ ctx, input }) => {
    try {
      const userId = ctx.auth.userId
      const organisation = await organisationManagementService.getOrganisationDetails(input.organisationId, userId)
      return organisation
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  }),
  addUserToOrganisation: protectedProcedure.input(z.object({
    organisationId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    password: z.string()
  })).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.auth.userId
      await organisationManagementService.addANewUserToOrganisation({
        currentUserId: userId,
        organisationId: input.organisationId,
        data: {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          password: input.password
        }
      })
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  }),
  updateOrganisationUserRole: protectedProcedure.input(z.object({
    organisationUserId: z.string(),
    role: z.enum(['ADMIN', 'MEMBER'])
  })).mutation(async ({ ctx, input }) => {
    try {
      const currentUserId = ctx.auth.userId
      await organisationManagementService.updateOrganisationUserRole({
        currentUserId,
        organisationUserId: input.organisationUserId,
        role: ORGANISATION_ROLE_ENUM[input.role]
      })
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  }),
  upsertOrganisationResourceLimits: protectedProcedure.input(upsertOrganisationResourceLimitsValidator).mutation(async ({ ctx, input }) => {
    try {
      const currentUserId = ctx.auth.userId
      await organisationManagementService.upsertOrganisationResourceLimits({
        currentUserId,
        organisationId: input.orgId,
        projectLimit: input.projectLimit,
        projectResetDuration: input.projectResetDuration,
        featureLimit: input.featureLimit
      })
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  })
})
