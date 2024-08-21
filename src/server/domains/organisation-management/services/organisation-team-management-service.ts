import { uuid } from "uuidv4"
import { OrganisationTeam } from "../models/organisation-team"
import { MEMBERSHIP_ROLE_ENUM } from "../models/membership"
import { type OrganisationRepository } from "../repo/organisation-repository"
import { type OrganisationTeamRepository } from "../repo/organisation-team-repository"
import { type MembershipRepository } from "../repo/membership-repository"
import { type OrganisationTeamMemberRepository } from '../repo/organisation-team-member-repository';
import { OrganisationTeamMember } from "../models/organisation-team-member"

interface CreateTeamArgs {
  organisationId: string
  name: string
  currentUserId: string
}

export class OrganisationTeamManagementService {
  constructor(

    private readonly organisationRepo: OrganisationRepository,
    private readonly membershipRepo: MembershipRepository,
    private readonly organisationTeamRepo: OrganisationTeamRepository,
    private readonly organisationTeamMemberRepository: OrganisationTeamMemberRepository
  ) { }

  public async createTeam(args: CreateTeamArgs) {
    try {
      const membership = await this.membershipRepo.getMembershipByUserIdOrFail(args.currentUserId)
      if (membership.role !== MEMBERSHIP_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')

      const orgTeam = new OrganisationTeam({
        id: uuid(),
        name: args.name,
        organisationId: args.organisationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      })
      await this.organisationTeamRepo.save(orgTeam)
    } catch (error) {
      throw new Error(`Error creating a organisation team: ${error}`)
    }
  }

  public async assignAMemberToTeam(args: {
    organisationId: string
    currentUserId: string
    orgTeamMemberId: string
    orgTeamId: string
  }) {
    try {
      const membership = await this.membershipRepo.getMembershipByUserIdOrFail(args.currentUserId)
      if (membership.role !== MEMBERSHIP_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')

      const existingOrgTeamMember = await this.organisationTeamMemberRepository.getTeamMemberByOrganisationTeamIdAndMembershipIdOrNull({
        organisationTeamId: args.orgTeamId,
        membershipId: args.orgTeamMemberId
      })

      /**@todo fix whacky error handling */
      if (existingOrgTeamMember) throw new Error('This member is already assigned to this team')

      const orgTeamMember = new OrganisationTeamMember({
        organisationTeamId: args.orgTeamId,
        membershipId: args.orgTeamMemberId,
        joinedAt: new Date(),
        leftAt: null
      })
      await this.organisationTeamMemberRepository.save(orgTeamMember)

    } catch (error) {
      throw new Error(`Error assigning an org member to a team: ${error}`)
    }
  }

  /**@todo might need to adapt team details and allow employee to query as well */
  public async getAllOrganisationTeams(args: { orgId: string, currentUserId: string }) {
    try {
      const membership = await this.membershipRepo.getMembershipByUserIdOrNull(args.currentUserId)
      if (!membership) throw new Error('You do not have permission to perform this operation')

      const orgTeams = (await this.organisationTeamRepo.getAllOrganisationTeamsByOrganisationId(args.orgId)).map(item => item.getValue())
      return orgTeams
    } catch (error) {
      throw new Error(`Error getting all organisation teams: ${error}`)
    }
  }

  public async getOrganisationTeamDetails(args: { orgId: string, teamId: string, currentUserId: string }) {
    try {
      const membership = await this.membershipRepo.getMembershipByUserIdOrFail(args.currentUserId)
      if (membership.role !== MEMBERSHIP_ROLE_ENUM.ADMIN && !membership.organisationTeamIds.includes(args.teamId)) throw new Error('You do not have permission to perform this operation')

      const orgTeam = await this.organisationTeamRepo.getOrganisationTeamByIdOrFail(args.teamId)
      const orgTeamMembers = (await this.organisationTeamMemberRepository.getTeamMembersByOrganisationTeamId(args.teamId))

      return {
        orgTeam: orgTeam.getValue(),
        orgTeamMembers
      }
    } catch (error) {
      throw new Error(`Error getting organisation team details: ${error}`)

    }
  }

  /**@description retrieves individual members who is not part of a team */
  public async getAllIndividualOrganisationMembers(args: {
    orgId: string,
    teamId: string,
    currentUserId: string
  }) {
    try {
      const membership = await this.membershipRepo.getMembershipByUserIdOrFail(args.currentUserId)
      if (membership.role !== MEMBERSHIP_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')

      const allOrgMembers = (await this.membershipRepo.getAllMemberships(args.orgId)).filter(user => user.role === MEMBERSHIP_ROLE_ENUM.MEMBER)
      const allOrgMembersInATeam = await this.organisationTeamMemberRepository.getAllTeamMembersInAnOrganisation({
        organisationId: args.orgId
      })

      const allOrgMembersNotInATeam = allOrgMembers.filter(member =>
        member.role === MEMBERSHIP_ROLE_ENUM.MEMBER &&
        !allOrgMembersInATeam.some(teamMember => teamMember.membershipId === member.id)
      );

      console.log({
        allOrgMembersNotInATeam
      })

      return allOrgMembersNotInATeam
    } catch (error) {
      throw new Error(`Error getting all individual organisation members: ${error}`)
    }
  }

  public async updateOrganisationTeam(args: {
    orgTeamId: string
    currentUserId: string
    name: string
  }) {
    try {
      const membership = await this.membershipRepo.getMembershipByUserIdOrFail(args.currentUserId)
      if (membership.role !== MEMBERSHIP_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')
      const existingOrgTeam = await this.organisationTeamRepo.getOrganisationTeamByIdOrFail(args.orgTeamId)

      const updatedOrganisationTeam = new OrganisationTeam({
        ...existingOrgTeam.getValue(),
        name: args.name
      })

      await this.organisationTeamRepo.update(updatedOrganisationTeam)

    } catch (error) {
      throw new Error(`Error updating organisation team: ${error}`)
    }
  }

  public async leaveOrganisationTeam(args: {
    orgId: string
    orgTeamId: string
    currentUserId: string
  }) {
    try {
      const membership = await this.membershipRepo.getMembershipByUserIdOrFail(args.currentUserId)
      const orgTeamMember = await this.organisationTeamMemberRepository.getTeamMemberByOrganisationTeamIdAndMembershipIdOrNull({
        organisationTeamId: args.orgTeamId,
        membershipId: membership.id
      })

      if (!orgTeamMember) throw new Error('User does not belong to any team')
      const updatedOrgTeamMember = new OrganisationTeamMember({
        ...orgTeamMember.getValue(),
        leftAt: new Date()
      })
      await this.organisationTeamMemberRepository.update(updatedOrgTeamMember)

    } catch (error) {
      throw new Error(`Error leaving organisation team: ${error}`)
    }
  }

  public async removeMemberFromOrganisationTeam(args: {
    orgTeamId: string
    orgTeamMemberId: string
    currentUserId: string
  }) {
    try {
      const membership = await this.membershipRepo.getMembershipByUserIdOrFail(args.currentUserId)
      if (membership.role !== MEMBERSHIP_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')

      const orgTeamMember = await this.organisationTeamMemberRepository.getTeamMemberByOrganisationTeamIdAndMembershipIdOrNull({
        organisationTeamId: args.orgTeamId,
        membershipId: args.orgTeamMemberId
      })

      if (!orgTeamMember) throw new Error('User does not belong to any team')

      const updatedOrgTeamMember = new OrganisationTeamMember({
        ...orgTeamMember.getValue(),
        leftAt: new Date()
      })
      await this.organisationTeamMemberRepository.update(updatedOrgTeamMember)

    } catch (error) {
      throw new Error(`Error removing member from organisation team: ${error}`)
    }
  }
}