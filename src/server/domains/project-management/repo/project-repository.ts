import { projectSchema } from './../../../db/schema';
import { DbService } from '~/server/db';
import { Project } from '../models/project';
import { eq } from 'drizzle-orm';

export class ProjectRepository {
  constructor(private readonly dbService: DbService) { }

  public async save(entity: Project) {
    try {
      await this.dbService.getQueryClient().insert(projectSchema).values(entity.getValue())
    } catch (error) {
      throw new Error(`Error saving project: ${error}`)
    }
  }

  public async getProjectByIdOrNull(id: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.projectSchema
        .findFirst({
          where: eq(projectSchema.id, id)
        })

      if (!rawResults) return null

      const project = new Project({
        id: rawResults.id,
        name: rawResults.name,
        userId: rawResults.userId,
        description: rawResults.description,
        createdAt: rawResults.createdAt,
        updatedAt: rawResults.updatedAt
      })

      return project
    } catch (error) {
      throw new Error(`Error getting project by id: ${error}`)
    }
  }

  public async getProjectsByUserId(userId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.projectSchema
        .findMany({
          where: eq(projectSchema.userId, userId)
        })

      if (!rawResults || rawResults.length === 0) return []

      const projects = rawResults.map(project => {
        return new Project({
          id: project.id,
          name: project.name,
          userId: project.userId,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        })
      })
      return projects
      
    } catch (error) {
      throw new Error(`Error getting projects by user id: ${error}`)
    }
  }
}