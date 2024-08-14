import { DbService } from '~/server/db';
import { OrganisationTeam } from './../models/organisation-team';
import { organisationTeamsSchema } from '~/server/db/schema';
import { and, count, eq, isNull } from 'drizzle-orm';

export class OrganisationTeamRepository {
  constructor(private readonly dbService: DbService) { }

  public async save(entity: OrganisationTeam) {
    try {
      await this.dbService.getQueryClient().insert(organisationTeamsSchema).values(entity.getValue())
    } catch (error) {
      throw new Error(`Error saving organisation team: ${error}`)
    }
  }

  public async update(entity: OrganisationTeam) {
    try {
      await this.dbService.getQueryClient().update(organisationTeamsSchema).set({ ...entity.getValue(), updatedAt: new Date() }).where(eq(organisationTeamsSchema.id, entity.getValue().id))
    } catch (error) {
      throw new Error(`Error updating organisation team: ${error}`)
    }
  }

  public async getAllOrganisationTeamsByOrganisationId(orgId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationTeamsSchema
        .findMany({
          where: and(eq(organisationTeamsSchema.organisationId, orgId), isNull(organisationTeamsSchema.deletedAt)),
        })
      if (!rawResults || rawResults.length === 0) return []
      const results = rawResults.map(team => {
        return new OrganisationTeam({
          id: team.id,
          name: team.name,
          organisationId: team.organisationId,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
          deletedAt: team.deletedAt,
        })
      })
      return results
    }
    catch (error) {
      throw new Error(`Error getting all organisation teams: ${error}`)
    }
  }

  public async getOrganisationTeamByIdOrNull(id: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationTeamsSchema
        .findFirst({
          where: and(eq(organisationTeamsSchema.id, id), isNull(organisationTeamsSchema.deletedAt))
        })
      if (!rawResults) return null
      return new OrganisationTeam({
        id: rawResults.id,
        name: rawResults.name,
        organisationId: rawResults.organisationId,
        createdAt: rawResults.createdAt,
        updatedAt: rawResults.updatedAt,
        deletedAt: rawResults.deletedAt,
      })
    } catch (error) {
      throw new Error(`Error getting organisation team by id: ${error}`)
    }
  }

  public async getOrganisationTeamByIdOrFail(id: string) {
    try {
      const results = await this.getOrganisationTeamByIdOrNull(id)
      if (!results) throw new Error(`Organisation team not found`)
      return results
    } catch (error) {
      throw new Error(`Error getting organisation team by id: ${error}`)
    }
  }
}
