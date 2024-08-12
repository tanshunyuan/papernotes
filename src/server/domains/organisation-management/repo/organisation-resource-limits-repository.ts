import { DbService } from "~/server/db";
import { OrganisationResourceLimits, ResourceLimitsConfigurationSchema } from "../models/organisation-resource-limits";
import { organisationResourceLimitsSchema } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export class OrganisationResourceLimitsRepository {

  constructor(private readonly dbService: DbService) { }

  public async save(entity: OrganisationResourceLimits) {
    try {
      const repoValue = entity.getValue();
      await this.dbService.getQueryClient().insert(organisationResourceLimitsSchema).values(repoValue)
    } catch (error) {
      throw new Error(`Error saving organisation resource limits: ${error}`)
    }
  }

  public async getResourceLimitsByOrganisationIdOrNull(organisationId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationResourceLimitsSchema
        .findFirst({
          where: eq(organisationResourceLimitsSchema.orgId, organisationId)
        })
      if (!rawResults) return null

      const verifiedConfiguration = ResourceLimitsConfigurationSchema.parse(rawResults.configuration)
      return new OrganisationResourceLimits({
        id: rawResults.id,
        orgId: rawResults.orgId,
        configuration: verifiedConfiguration,
        createdAt: rawResults.createdAt,
        updatedAt: rawResults.updatedAt
      })
    }
    catch (error) {
      throw new Error(`Error getting resource limits by organisation id: ${error}`)
    }
  }

  public async getResourceLimitsByIdOrNull(id: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationResourceLimitsSchema
        .findFirst({
          where: eq(organisationResourceLimitsSchema.id, id)
        })
      if (!rawResults) return null

      const verifiedConfiguration = ResourceLimitsConfigurationSchema.parse(rawResults.configuration)
      return new OrganisationResourceLimits({
        id: rawResults.id,
        orgId: rawResults.orgId,
        configuration: verifiedConfiguration,
        createdAt: rawResults.createdAt,
        updatedAt: rawResults.updatedAt
      })
    }
    catch (error) {
      throw new Error(`Error getting resource limits by id: ${error}`)
    }
  }

  public async getResourceLimitsByIdOrFail(id: string) {
    const result = await this.getResourceLimitsByIdOrNull(id)
    if (!result) throw new Error(`Organisation resource limits not found: ${id}`)
    return result
  }

  public async update(entity: OrganisationResourceLimits) {
    try {
      await this.dbService.getQueryClient().update(organisationResourceLimitsSchema)
        .set({ ...entity.getValue(), updatedAt: new Date() })
        .where(eq(organisationResourceLimitsSchema.id, entity.getValue().id))
    }
    catch (error) {
      throw new Error(`Error updating organisation resource limits: ${error}`)
    }
  }
}
