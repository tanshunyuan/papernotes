import { DbService } from "~/server/db";
import { ORGANISATION_ROLE_ENUM, OrganisationUser } from "../models/organisation-user";
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
          where: eq(organisationUsersSchema.organisationId, organisationId),
          with: {
            user: {
              columns: { email: true }
            }
          }
        })
      if (!rawResults || rawResults.length === 0) return []
      console.log("rawResults", rawResults)
      const results = rawResults.map(organisationUser => {
        return {
          ...new OrganisationUser({
            id: organisationUser.id,
            organisationId: organisationUser.organisationId,
            userId: organisationUser.userId,
            role: ORGANISATION_ROLE_ENUM[organisationUser.role],
            createdAt: organisationUser.createdAt,
            updatedAt: organisationUser.updatedAt
          }).getValue(), email: organisationUser.user.email
        }
      })
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
      const result = new OrganisationUser({
        id: rawResults.id,
        organisationId: rawResults.organisationId,
        userId: rawResults.userId,
        role: ORGANISATION_ROLE_ENUM[rawResults.role],
        createdAt: rawResults.createdAt,
        updatedAt: rawResults.updatedAt
      })
      return result
    }
    catch (error) {
      throw new Error(`Error getting organisation user by id: ${error}`)
    }
  }

  public async getOrganisationUserByUserIdOrNull(userId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationUsersSchema.findFirst({
        where: eq(organisationUsersSchema.userId, userId)
      })

      if (!rawResults) return null
      const result = new OrganisationUser({
        id: rawResults.id,
        organisationId: rawResults.organisationId,
        userId: rawResults.userId,
        role: ORGANISATION_ROLE_ENUM[rawResults.role],
        createdAt: rawResults.createdAt,
        updatedAt: rawResults.updatedAt
      })
      return result
    } catch (error) {
      throw new Error(`Error getting organisation user by user id: ${error}`)
    }
  }

  public async getOrganisationUserByIdOrFail(id: string) {
    const result = await this.getOrganisationUserByIdOrNull(id)
    if (!result) throw new Error(`Organisation user not found: ${id}`)
    return result
  }

  public async updateOrganisationUserRole(entity: OrganisationUser) {
    try {
      await this.dbService.getQueryClient().update(organisationUsersSchema)
        .set({ ...entity.getValue(), updatedAt: new Date() })
        .where(eq(organisationUsersSchema.id, entity.getValue().id))
    }
    catch (error) {
      throw new Error(`Error updating organisation user role: ${error}`)
    }
  }
}