import { DbService } from "~/server/db";
import { OrganisationUser } from "../models/organisation-user";
import { organisationUsersSchema } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export class OrganisationUserRepository {

  constructor(private readonly dbService: DbService) { }

  public async save(entity: OrganisationUser) {
    try {
      const repoValue = entity.getValue();
      await this.dbService.getQueryClient().insert(organisationUsersSchema).values(repoValue)
    } catch (error) {
      throw new Error(`Error saving organisation user: ${error}`)
    }
  }

  public async getAllOrganisationUsers(organisationId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationUsersSchema
        .findMany({
          where: eq(organisationUsersSchema.organisationId, organisationId)
        })
      if (!rawResults || rawResults.length === 0) return []
      const results = rawResults.map(organisationUser => new OrganisationUser(organisationUser))
      return results
    }
    catch (error) {
      throw new Error(`Error getting all organisation users: ${error}`)
    }
  }

  public async getOrganisationUserByIdOrNull(id: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationUsersSchema
        .findFirst({
          where: eq(organisationUsersSchema.id, id)
        })
      if (!rawResults) return null
      const result = new OrganisationUser(rawResults)
      return result
    }
    catch (error) {
      throw new Error(`Error getting organisation user by id: ${error}`)
    }
  }
}