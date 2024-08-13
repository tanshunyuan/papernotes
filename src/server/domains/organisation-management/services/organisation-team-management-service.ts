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

interface AssignAOrgUserToTeamArgs{
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

      const existingOrgTeamUser = await this.organisationTeamUserRepository.getTeamUserByOrganisationAndUserIdOrNull(args.organisationId, args.orgTeamMemberId)
      if (existingOrgTeamUser) throw new Error('This user is already assigned to this team')

      const orgTeamUser = new OrganisationTeamUser({
        organisationTeamId: args.orgTeamId,
        organisationUserId: args.orgTeamMemberId,
        joinedAt: new Date(),
        leftAt: null
      })
      await this.organisationTeamUserRepository.save(orgTeamUser)
      
    } catch (error) {
      throw new Error(`Error assigning an org user to a team, ${error}`)
    }
  }
}