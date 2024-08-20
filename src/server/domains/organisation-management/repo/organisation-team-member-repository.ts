import { DbService } from '~/server/db';
import { membershipsSchema, organisationTeamMembersSchema, organisationTeamsSchema, userSchema } from '~/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { OrganisationTeamMember } from '../models/organisation-team-member';
// how do i check if a user is part of a team? 

export class OrganisationTeamMemberRepository {
  constructor(private readonly dbService: DbService) { }

  public async save(entity: OrganisationTeamMember) {
    try {
      await this.dbService.getQueryClient().insert(organisationTeamMembersSchema).values(entity.getValue())
    } catch (error) {
      throw new Error(`Error saving organisation team member: ${error}`)
    }
  }

  public async update(entity: OrganisationTeamMember) {
    try {
      await this.dbService.getQueryClient().update(organisationTeamMembersSchema)
        .set({ ...entity.getValue() })
        .where(and(
          eq(organisationTeamMembersSchema.organisationTeamId, entity.getValue().organisationTeamId),
          eq(organisationTeamMembersSchema.membershipId, entity.getValue().membershipId)
        ))
    } catch (error) {
      throw new Error(`Error updating organisation team member: ${error}`)
    }
  }

  /**@todo add join to retrieve full org user & team information */
  public async getTeamMembersByOrganisationTeamId(organisationTeamId: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationTeamMembersSchema
        .findMany({
          where: and(eq(organisationTeamMembersSchema.organisationTeamId, organisationTeamId), isNull(organisationTeamMembersSchema.leftAt)),
          with: {
            members: {
              columns: {
                userId: true,
              },
              with: {
                user: {
                  columns: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        })
      if (!rawResults || rawResults.length === 0) return []
      const results = rawResults.map(teamMember => {
        return {
          ...new OrganisationTeamMember({
            organisationTeamId: teamMember.organisationTeamId,
            membershipId: teamMember.membershipId,
            joinedAt: teamMember.joinedAt,
            leftAt: teamMember.leftAt,
          }).getValue(),
          userId: teamMember.members.userId,
          name: teamMember.members.user.name,
          email: teamMember.members.user.email
        }
      }
      )
      return results
    }
    catch (error) {
      throw new Error(`Error getting team members by organisation team id: ${error}`)
    }
  }

  public async getTeamMemberByOrganisationTeamIdAndMembershipIdOrNull(args: {
    organisationTeamId: string
    membershipId: string
  }) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationTeamMembersSchema
        .findFirst({
          where: and(
            eq(organisationTeamMembersSchema.organisationTeamId, args.organisationTeamId),
            eq(organisationTeamMembersSchema.membershipId, args.membershipId)
          )
        })
      if (!rawResults) return null
      return new OrganisationTeamMember({
        organisationTeamId: rawResults.organisationTeamId,
        membershipId: rawResults.membershipId,
        joinedAt: rawResults.joinedAt,
        leftAt: rawResults.leftAt,
      })
    } catch (error) {
      throw new Error(`Error getting team member by organisation team id and user id: ${error}`)
    }
  }

  /**
   * @description check if user is part of a team 
   * @todo account for leftAt when querying in the future
   */
  public async getTeamMemberByMembershipIdOrNull(args: {
    membershipId: string
  }) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.organisationTeamMembersSchema
        .findFirst({
          where: and(eq(organisationTeamMembersSchema.membershipId, args.membershipId), isNull(organisationTeamMembersSchema.leftAt)),
          with: {
            organisation_team: {
              columns: {
                name: true,
              }
            }
          }
        })
      if (!rawResults) return null
      return {
        ...new OrganisationTeamMember({
          organisationTeamId: rawResults.organisationTeamId,
          membershipId: rawResults.membershipId,
          joinedAt: rawResults.joinedAt,
          leftAt: rawResults.leftAt,
        }).getValue(),
        teamName: rawResults.organisation_team.name,
      }
    } catch (error) {
      throw new Error(`Error getting team member by organisation user id: ${error}`)
    }
  }

  public async getAllTeamMembersInAnOrganisation(args: { organisationId: string }) {
    try {

      const rawResults = await this.dbService.getQueryClient().select()
        .from(organisationTeamMembersSchema)
        .leftJoin(organisationTeamsSchema, eq(organisationTeamMembersSchema.organisationTeamId, organisationTeamsSchema.id))
        .leftJoin(membershipsSchema, eq(membershipsSchema.id, organisationTeamMembersSchema.membershipId))
        .leftJoin(userSchema, eq(userSchema.id, membershipsSchema.userId))
        .where(and(eq(organisationTeamsSchema.organisationId, args.organisationId), isNull(organisationTeamMembersSchema.leftAt)))

      if (!rawResults || rawResults.length === 0) return []
      const results = rawResults.map(item => {
        const { organisation_team_members: teamMember, users: user } = item
        return {
          ...new OrganisationTeamMember({
            organisationTeamId: teamMember.organisationTeamId,
            membershipId: teamMember.membershipId,
            joinedAt: teamMember.joinedAt,
            leftAt: teamMember.leftAt,
          }).getValue(),
          userId: user!.id,
          name: user!.name,
          email: user!.email,
        }
      }
      )
      return results
    } catch (error) {
      throw new Error(`Error getting team member by organisation user id: ${error}`)
    }
  }
}
