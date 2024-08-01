import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Project } from '../../domains/project-management/models/project';
import { uuid } from 'uuidv4';
import { projectRepository } from '~/server/domains/project-management/repo';

const createProjectValidator = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
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
      const projects = (await projectRepository.getProjectsByUserId(userId)).map(project => project.getValue())
      return projects
    } catch (e) {
      const error = e as Error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }
  })
})