import { DbService } from '~/server/db';
import { organisationTeamUsersSchema } from '~/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { OrganisationTeamUser } from '../models/organisation-team-user';

export class OrganisationTeamUserRepository {
  constructor(private readonly dbService: DbService) { }

  public async save(entity: OrganisationTeamUser) {
    try {
      await this.dbService.getQueryClient().insert(organisationTeamUsersSchema).values(entity.getValue())
    } catch (error) {
      throw new Error(`Error saving organisation team user: ${error}`)
    }
  }

  public async update(entity: OrganisationTeamUser) {
    try {
      await this.dbService.getQueryClient().update(organisationTeamUsersSchema)
        .set({ ...entity.getValue() })
        .where(and(
          eq(organisationTeamUsersSchema.organisationTeamId, entity.getValue().organisationTeamId),
          eq(organisationTeamUsersSchema.organisationUserId, entity.getValue().organisationUserId)
        ))
    } catch (error) {
      throw new Error(`Error updating organisation team user: ${error}`)
    }
  }

  /**@todo add join to retrieve full org user & team information */
  public async getTeamUsersByOrganisationId(organisationId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationTeamUsersSchema
        .findMany({
          where: eq(organisationTeamUsersSchema.organisationTeamId, organisationId),
        })
      if (!rawResults || rawResults.length === 0) return []
      const results = rawResults.map(teamUser => new OrganisationTeamUser({
        organisationTeamId: teamUser.organisationTeamId,
        organisationUserId: teamUser.organisationUserId,
        joinedAt: teamUser.joinedAt,
        leftAt: teamUser.leftAt,
      }))
      return results
    }
    catch (error) {
      throw new Error(`Error getting team users by organisation id: ${error}`)
    }
  }

  public async getTeamUserByOrganisationAndUserIdOrNull(organisationId: string, organisationUserId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationTeamUsersSchema
        .findFirst({
          where: and(
            eq(organisationTeamUsersSchema.organisationTeamId, organisationId),
            eq(organisationTeamUsersSchema.organisationUserId, organisationUserId)
          )
        })
      if (!rawResults) return null
      return new OrganisationTeamUser({
        organisationTeamId: rawResults.organisationTeamId,
        organisationUserId: rawResults.organisationUserId,
        joinedAt: rawResults.joinedAt,
        leftAt: rawResults.leftAt,
      })
    } catch (error) {
      throw new Error(`Error getting team user by organisation and user id: ${error}`)
    }
  }
}
