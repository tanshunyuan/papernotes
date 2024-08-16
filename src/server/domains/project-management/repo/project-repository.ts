import { organisationSchema, organisationTeamsSchema, organisationTeamUsersSchema, organisationUsersSchema, projectSchema, userSchema } from './../../../db/schema';
import { DbService } from '~/server/db';
import { Project } from '../models/project';
import { and, count, eq, isNull } from 'drizzle-orm';

export class ProjectRepository {
  constructor(private readonly dbService: DbService) { }

  public async save(entity: Project) {
    try {
      await this.dbService.getQueryClient().insert(projectSchema).values(entity.getValue())
    } catch (error) {
      throw new Error(`Error saving project: ${error}`)
    }
  }

  public async update(entity: Project) {
    try {
      await this.dbService.getQueryClient().update(projectSchema).set({ ...entity.getValue(), updatedAt: new Date() }).where(eq(projectSchema.id, entity.getValue().id))
    } catch (error) {
      throw new Error(`Error updating project: ${error}`)
    }
  }

  public async delete(id: string) {
    try {
      await this.dbService.getQueryClient().update(projectSchema).set({ deletedAt: new Date() }).where(eq(projectSchema.id, id))
    } catch (error) {
      throw new Error(`Error deleting project: ${error}`)
    }
  }

  public async getProjectByIdOrNull(id: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.projectSchema
        .findFirst({
          where: and(eq(projectSchema.id, id), isNull(projectSchema.deletedAt))
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

  public async getProjectCountOrNullByUserId(userId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().select({
        count: count()
      }).from(projectSchema).where(eq(projectSchema.userId, userId))
      console.log('rawResults', rawResults)
      if (!rawResults) return null

      // @ts-expect-error idk what this mian talking about
      return rawResults[0].count
    }
    catch (error) {
      throw new Error(`Error getting project count by user id: ${error}`)
    }
  }

  public async getProjectByIdOrFail(id: string) {
    try {
      const project = await this.getProjectByIdOrNull(id)
      if (!project) {
        throw new Error('Project not found')
      }
      return project
    } catch (error) {
      throw new Error(`Error getting project by id: ${error}`)
    }
  }


  public async getProjectsByUserId(userId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.projectSchema
        .findMany({
          where: eq(projectSchema.userId, userId),
          with: {
            users: {
              columns: {
                email: true
              }
            }
          }
        })

      if (!rawResults || rawResults.length === 0) return []

      const projects = rawResults.map(project => {
        return new Project({
          id: project.id,
          name: project.name,
          userId: project.userId,
          description: project.description,
          createdBy: project.users.email,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        })
      })
      return projects

    } catch (error) {
      throw new Error(`Error getting projects by user id: ${error}`)
    }
  }

  public async getAllProjects() {
    try {
      const rawResults = await this.dbService.getQueryClient().query.projectSchema
        .findMany({
          where: isNull(projectSchema.deletedAt)
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
      throw new Error(`Error getting all projects: ${error}`)
    }
  }

  public async getAllOrganisationProjects(organisationId: string) {
    try {

      const rawResults = await this.dbService.getQueryClient().select().from(projectSchema)
        .leftJoin(organisationUsersSchema, eq(organisationUsersSchema.userId, projectSchema.userId))
        .leftJoin(userSchema, eq(userSchema.id, projectSchema.userId))
        .where(eq(organisationUsersSchema.organisationId, organisationId));

      if (!rawResults || rawResults.length === 0) return []

      const projects = rawResults.map(items => {
        return new Project({
          id: items.projects.id,
          name: items.projects.name,
          userId: items.projects.userId,
          description: items.projects.description,
          createdBy: items.users?.email,
          createdAt: items.projects.createdAt
        })
      })

      return projects

    } catch (error) {
      throw new Error(`Error getting all projects for organisation: ${error}`)
    }

  }
  public async getAllOrganisationTeamProjects(args: {
    orgTeamId: string
  }) {
    try {
      const rawResults = await this.dbService.getQueryClient().select().from(projectSchema)
        .leftJoin(userSchema, eq(projectSchema.userId, userSchema.id))
        .leftJoin(organisationUsersSchema, eq(userSchema.id, organisationUsersSchema.userId))
        .leftJoin(organisationTeamUsersSchema, eq(organisationUsersSchema.id, organisationTeamUsersSchema.organisationUserId))
        .leftJoin(organisationTeamsSchema, eq(organisationTeamUsersSchema.organisationTeamId, organisationTeamsSchema.id))
        .leftJoin(organisationSchema, eq(organisationTeamsSchema.organisationId, organisationSchema.id))
        .where(eq(organisationTeamsSchema.id, args.orgTeamId)).execute()

      if (!rawResults || rawResults.length === 0) return []

      const results = rawResults.map(items => {
        return new Project({
          id: items.projects.id,
          name: items.projects.name,
          userId: items.projects.userId,
          description: items.projects.description,
          createdBy: items.users?.email,
          createdAt: items.projects.createdAt
        })
      })
      return results
    } catch (error) {
      throw new Error(`Error getting all projects for organisation: ${error}`)
    }
  }
}