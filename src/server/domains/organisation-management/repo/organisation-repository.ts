import { DbService } from '~/server/db';
import { Organisation, ORGANISATION_TYPE_ENUM } from './../models/organisation';
import { organisationSchema } from '~/server/db/schema';
import { and, count, eq, isNull } from 'drizzle-orm';
import { OrganisationMapper } from '../mappers';

export class OrganisationRepository {
  private readonly mapper = new OrganisationMapper();

  constructor(private readonly dbService: DbService) { }

  public async save(entity: Organisation) {
    try {
      const repoValue = this.mapper.toRepo(entity);
      await this.dbService.getQueryClient().insert(organisationSchema).values(repoValue)
    } catch (error) {
      throw new Error(`Error saving organisation: ${error}`)
    }
  }

  public async update(entity: Organisation) {
    try {
      const repoValue = this.mapper.toRepo(entity);
      await this.dbService.getQueryClient().update(organisationSchema).set({ ...repoValue, updatedAt: new Date() }).where(eq(organisationSchema.id, entity.getValue().id))
    } catch (error) {
      throw new Error(`Error updating organisation: ${error}`)
    }
  }

  public async getAllOrganisations(args: { organisationType: ORGANISATION_TYPE_ENUM}) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationSchema
        .findMany({
          where: and(isNull(organisationSchema.deletedAt), eq(organisationSchema.type, args.organisationType)),
        })
      if (!rawResults || rawResults.length === 0) return []
      const results = rawResults.map(organisation => this.mapper.toDomain(organisation))
      return results
    }
    catch (error) {
      throw new Error(`Error getting all organisations: ${error}`)
    }
  }

  public async getOrganisationByIdOrNull(id: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationSchema
        .findFirst({
          where: and(eq(organisationSchema.id, id), isNull(organisationSchema.deletedAt))
        })
      if (!rawResults) return null
      return this.mapper.toDomain(rawResults)
    } catch (error) {
      throw new Error(`Error getting organisation by id: ${error}`)
    }
  }

  public async getOrganisationByIdOrFail(id: string) {
    try {
      const results = await this.getOrganisationByIdOrNull(id)
      if (!results) throw new Error(`Organisation not found`)
      return results
    } catch (error) {
      throw new Error(`Error getting organisation by name: ${error}`)
    }
  }

}