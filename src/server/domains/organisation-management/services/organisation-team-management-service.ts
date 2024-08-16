import { uuid } from "uuidv4"
import { OrganisationTeam } from "../models/organisation-team"
import { ORGANISATION_ROLE_ENUM } from "../models/organisation-user"
import { OrganisationRepository } from "../repo/organisation-repository"
import { OrganisationTeamRepository } from "../repo/organisation-team-repository"
import { OrganisationUserRepository } from "../repo/organisation-user-repository"
import { OrganisationTeamUserRepository } from '../repo/organisation-team-user-repository';
import { OrganisationTeamUser } from "../models/organisation-team-user"

interface CreateTeamArgs {
  organisationId: string
  name: string
  currentUserId: string
}

interface AssignAOrgUserToTeamArgs {
  organisationId: string
  currentUserId: string
  orgTeamMemberId: string
  orgTeamId: string
}

export class OrganisationTeamManagementService {
  constructor(

    private readonly organisationRepo: OrganisationRepository,
    private readonly organisationUserRepo: OrganisationUserRepository,
    private readonly organisationTeamRepo: OrganisationTeamRepository,
    private readonly organisationTeamUserRepository: OrganisationTeamUserRepository
  ) { }

  public async createTeam(args: CreateTeamArgs) {
    try {
      const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrFail(args.currentUserId)
      if (organisationUser.getValue().role !== ORGANISATION_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')

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

  public async assignAOrgUserToTeam(args: AssignAOrgUserToTeamArgs) {
    try {
      const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrFail(args.currentUserId)
      if (organisationUser.getValue().role !== ORGANISATION_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')

      const existingOrgTeamUser = await this.organisationTeamUserRepository.getTeamUserByOrganisationTeamIdAndUserIdOrNull({
        organisationTeamId: args.orgTeamId,
        organisationUserId: args.orgTeamMemberId
      })

      /**@todo fix whacky error handling */
      if (existingOrgTeamUser) throw new Error('This user is already assigned to this team')

      const orgTeamUser = new OrganisationTeamUser({
        organisationTeamId: args.orgTeamId,
        organisationUserId: args.orgTeamMemberId,
        joinedAt: new Date(),
        leftAt: null
      })
      await this.organisationTeamUserRepository.save(orgTeamUser)

    } catch (error) {
      throw new Error(`Error assigning an org user to a team: ${error}`)
    }
  }

  /**@todo might need to adapt team details and allow gignite employee to query as well */
  public async getAllOrganisationTeams(args: { orgId: string, currentUserId: string }) {
    try {
      const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrNull(args.currentUserId)
      if (!organisationUser) throw new Error('You do not have permission to perform this operation')

      const orgTeams = (await this.organisationTeamRepo.getAllOrganisationTeamsByOrganisationId(args.orgId)).map(item => item.getValue())
      return orgTeams
    } catch (error) {
      throw new Error(`Error getting all organisation teams: ${error}`)
    }
  }

  public async getOrganisationTeamDetails(args: { orgId: string, teamId: string, currentUserId: string }) {
    try {
      const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrFail(args.currentUserId)
      if (organisationUser.getValue().role !== ORGANISATION_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')

      const orgTeam = await this.organisationTeamRepo.getOrganisationTeamByIdOrFail(args.teamId)
      const orgTeamUsers = (await this.organisationTeamUserRepository.getTeamUsersByOrganisationTeamId(args.teamId))

      return {
        orgTeam: orgTeam.getValue(),
        orgTeamUsers
      }
    } catch (error) {
      throw new Error(`Error getting organisation team details: ${error}`)

    }
  }

  /**@todo update query or filter to show that member is assigned alrdy so that unassignment is possible */
  public async getAllOrganisationTeamUsers(args: {
    orgId: string,
    teamId: string,
    currentUserId: string
  }) {
    try {
      const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrFail(args.currentUserId)
      if (organisationUser.getValue().role !== ORGANISATION_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')

      const orgUsers = (await this.organisationUserRepo.getAllOrganisationUsers(args.orgId)).filter(user => user.role === ORGANISATION_ROLE_ENUM.MEMBER)
      return orgUsers

    } catch (error) {
      throw new Error(`Error getting organisation team users: ${error}`)
    }
  }

  public async updateOrganisationTeam(args: {
    orgTeamId: string
    currentUserId: string
    name: string
  }) {
    try {
      const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrFail(args.currentUserId)
      if (organisationUser.getValue().role !== ORGANISATION_ROLE_ENUM.ADMIN) throw new Error('You do not have permission to perform this operation')
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
}