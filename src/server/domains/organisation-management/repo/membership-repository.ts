import { DbService } from "~/server/db";
import { MEMBERSHIP_ROLE_ENUM, Membership } from "../models/membership";
import { eq } from "drizzle-orm";
import { membershipsSchema } from "~/server/db/schema";

export class MembershipRepository {

  constructor(private readonly dbService: DbService) { }

  /**
   * @todo need to check if there are other isCurrent that are true, if so set them to false
   * and only allow the incoming one to be true
   */
  public async save(entity: Membership) {
    try {
      const repoValue = entity.getValue();
      await this.dbService.getQueryClient().insert(membershipsSchema).values(repoValue)
    } catch (error) {
      throw new Error(`Error saving organisation user: ${error}`)
    }
  }

  public async getAllMemberships(organisationId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.membershipsSchema
        .findMany({
          where: eq(membershipsSchema.organisationId, organisationId),
          with: {
            user: {
              columns: { email: true, name: true }
            }
          }
        })
      if (!rawResults || rawResults.length === 0) return []
      const results = rawResults.map(membership => {
        return {
          ...new Membership({
            id: membership.id,
            organisationId: membership.organisationId,
            userId: membership.userId,
            role: MEMBERSHIP_ROLE_ENUM[membership.role],
            createdAt: membership.createdAt,
            updatedAt: membership.updatedAt,
            isCurrent: membership.isCurrent
          }).getValue(), email: membership.user.email, name: membership.user.name
        }
      })
      return results
    }
    catch (error) {
      throw new Error(`Error getting all organisation users: ${error}`)
    }
  }

  public async getMembershipByIdOrNull(id: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.membershipsSchema
        .findFirst({
          where: eq(membershipsSchema.id, id)
        })
      if (!rawResults) return null
      const result = new Membership({
        id: rawResults.id,
        organisationId: rawResults.organisationId,
        userId: rawResults.userId,
        role: MEMBERSHIP_ROLE_ENUM[rawResults.role],
        createdAt: rawResults.createdAt,
        updatedAt: rawResults.updatedAt,
        isCurrent: rawResults.isCurrent
      })
      return result
    }
    catch (error) {
      throw new Error(`Error getting organisation user by id: ${error}`)
    }
  }

  public async getMembershipByIdOrFail(id: string) {
    const result = await this.getMembershipByIdOrNull(id)
    if (!result) throw new Error(`Organisation user not found: ${id}`)
    return result
  }

  public async getMembershipByUserIdOrNull(userId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.membershipsSchema.findFirst({
        where: eq(membershipsSchema.userId, userId),
        with: {
          organisation_team_members: {
            columns: {
              organisationTeamId: true
            }
          }
        }
      })


      if (!rawResults) return null
      const result = {
        ...new Membership({
          id: rawResults.id,
          organisationId: rawResults.organisationId,
          userId: rawResults.userId,
          role: MEMBERSHIP_ROLE_ENUM[rawResults.role],
          createdAt: rawResults.createdAt,
          updatedAt: rawResults.updatedAt,
          isCurrent: rawResults.isCurrent
        }).getValue(),
        organisationTeamIds: rawResults.organisation_team_members.map(teamMember => teamMember.organisationTeamId)
      }
      return result
    } catch (error) {
      throw new Error(`Error getting organisation user by user id: ${error}`)
    }
  }

  public async getMembershipByUserIdOrFail(userId: string) {
    const result = await this.getMembershipByUserIdOrNull(userId)
    if (!result) throw new Error(`Organisation user not found: ${userId}`)
    return result
  }

  public async updateMembershipRole(entity: Membership) {
    try {
      await this.dbService.getQueryClient().update(membershipsSchema)
        .set({ ...entity.getValue(), updatedAt: new Date() })
        .where(eq(membershipsSchema.id, entity.getValue().id))
    }
    catch (error) {
      throw new Error(`Error updating organisation user role: ${error}`)
    }
  }
}