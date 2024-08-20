import { membershipsSchema, organisationSchema, organisationTeamMembersSchema, organisationTeamsSchema, projectSchema, userSchema } from './../../../db/schema';
import { DbService } from '~/server/db';
import { Project } from '../models/project';
import { and, count, eq, isNull } from 'drizzle-orm';
import { ProjectMapper } from '../mappers';

export class ProjectRepository {
  private readonly mapper = new ProjectMapper()
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

      const result = this.mapper.toDomain(rawResults)

      return result
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


  /**@deprecated use organisationId instead getAllOrganisationProjects*/
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

      const results = rawResults.map(project => {
        return this.mapper.toDomain(project)
      })
      return results

    } catch (error) {
      throw new Error(`Error getting projects by user id: ${error}`)
    }
  }

  /**@warning might be the same as  */
  public async getProjectsByOrganisationIdAndUserId(args: { orgId: string, userId: string }) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.projectSchema
        .findMany({
          where: and(
            eq(projectSchema.organisationId, args.orgId), 
          eq(projectSchema.userId, args.userId)
        ),
          with: {
            users: {
              columns: {
                email: true
              }
            }
          }
        })

      if (!rawResults || rawResults.length === 0) return []

      const results = rawResults.map(project => {
        return this.mapper.toDomain({ ...project, createdBy: project.users.email })
      })
      return results
    } catch (error) {
      throw new Error(`Error getting projects by organisation id: ${error}`)
    }
  }

  public async getAllProjects() {
    try {
      const rawResults = await this.dbService.getQueryClient().query.projectSchema
        .findMany({
          where: isNull(projectSchema.deletedAt)
        })

      if (!rawResults || rawResults.length === 0) return []

      const results = rawResults.map(project => {
        return this.mapper.toDomain(project)
      })
      return results

    } catch (error) {
      throw new Error(`Error getting all projects: ${error}`)
    }
  }

  public async getAllOrganisationProjects(args: { orgId: string }) {
    try {

      // const rawResults = await this.dbService.getQueryClient().select().from(projectSchema)
      //   .leftJoin(MembershipsSchema, eq(MembershipsSchema.userId, projectSchema.userId))
      //   .leftJoin(userSchema, eq(userSchema.id, projectSchema.userId))
      //   .leftJoin(organisationSchema, eq(organisationSchema.id, MembershipsSchema.organisationId))
      //   .where(eq(MembershipsSchema.organisationId, args.orgId));
      const rawResults = await this.dbService.getQueryClient().query.projectSchema.findMany({
        where: eq(projectSchema.organisationId, args.orgId),
        with: {
          users: {
            columns: {
              email: true
            }
          }
        }
      })

      if (!rawResults || rawResults.length === 0) return []

      const projects = rawResults.map(items => {
        return this.mapper.toDomain({
          id: items.id,
          name: items.name,
          userId: items.userId,
          description: items.description,
          createdBy: items.users?.email,
          createdAt: items.createdAt,
          updatedAt: items.updatedAt,
          deletedAt: items.deletedAt,
          organisationId: items.organisationId,
          organisationTeamId: items.organisationTeamId
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
        .leftJoin(membershipsSchema, eq(userSchema.id, membershipsSchema.userId))
        .leftJoin(organisationTeamMembersSchema, eq(membershipsSchema.id, organisationTeamMembersSchema.membershipId))
        .leftJoin(organisationTeamsSchema, eq(organisationTeamMembersSchema.organisationTeamId, organisationTeamsSchema.id))
        .leftJoin(organisationSchema, eq(organisationTeamsSchema.organisationId, organisationSchema.id))
        .where(eq(organisationTeamsSchema.id, args.orgTeamId)).execute()

      if (!rawResults || rawResults.length === 0) return []

      const results = rawResults.map(items => {
        return this.mapper.toDomain({
          id: items.projects.id,
          name: items.projects.name,
          userId: items.projects.userId,
          description: items.projects.description,
          createdBy: items.users?.email,
          createdAt: items.projects.createdAt,
          updatedAt: items.projects.updatedAt,
          deletedAt: items.projects.deletedAt,
          organisationId: items.organisations?.id ?? null,
          organisationTeamId: null
        })
      })
      return results
    } catch (error) {
      throw new Error(`Error getting all projects for organisation: ${error}`)
    }
  }
}