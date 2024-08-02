import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Project } from '../../domains/project-management/models/project';
import { uuid } from 'uuidv4';
import { projectRepository } from '~/server/domains/project-management/repo';
import { projectManagementService } from '~/server/domains/project-management/services';

const createProjectValidator = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
})

const updateProjectValidator = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
})

const deleteProjectValidator = z.object({
  id: z.string(),
})

export const projectRouter = createTRPCRouter({
  create: protectedProcedure.input(createProjectValidator).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.auth.userId

      const project = new Project({
        id: uuid(),
        name: input.name,
        userId: userId,
        description: input.description,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await projectRepository.save(project)


    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  }),

  getProjectsByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId
    try {
      const projects = await projectManagementService.getProjectsByUserId(userId)
      return projects
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  }),

  updateAProject: protectedProcedure.input(updateProjectValidator).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.auth.userId
      await projectManagementService.updateProject(userId, input.id, input.name, input.description)
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  }),

  deleteAProject: protectedProcedure.input(deleteProjectValidator).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.auth.userId

    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  })
})