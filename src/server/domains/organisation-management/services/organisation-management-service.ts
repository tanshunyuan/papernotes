import { uuid } from "uuidv4";
import { Organisation } from "../models/organisation";
import { OrganisationRepository } from "../repo/organisation-repository";
import { OrganisationUserRepository } from "../repo/organisation-user-repository";
import { OrganisationUser } from "../models/organisation-user";

interface CreateOrganisationArgs {
  userId: string;
  name: string;
  description: string;
  planDurationStart: Date;
  planDurationEnd: Date;
  maxSeats: number;
}

export class OrganisationManagementService {
  constructor(
    private readonly organisationRepository: OrganisationRepository,
    private readonly organisationUserRepository: OrganisationUserRepository
  ) { }

  public async createOrganisation(args: CreateOrganisationArgs) {
    /**@todo need to add rule to only allow internal employee to create organisation */
    try {
      const organisation = new Organisation({
        id: uuid(),
        name: args.name,
        description: args.description,
        planDurationStart: args.planDurationStart,
        planDurationEnd: args.planDurationEnd,
        maxSeats: args.maxSeats,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      await this.organisationRepository.save(organisation)
    } catch (error) {
      throw new Error(`Error creating organisation: ${error}`)
    }
  }

  public async addAUserToOrganisation(organisationId: string, userId: string) {
    try {
      /**@todo need to add rule to only allow internal employee to create organisation user OR organisation admin to create organisation user */
      await this.organisationRepository.getOrganisationByIdOrFail(organisationId)

      const organisationUser = new OrganisationUser({
        id: uuid(),
        organisationId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      await this.organisationUserRepository.save(organisationUser)
    } catch (error) {
      throw new Error(`Error creating organisation user: ${error}`)
    }
  }

  public async getOrganisationDetails(organisationId: string, userId: string) {
    try {
      /**@todo  need to add rule to only allow organisation user to get organisation details */

      const organisation = await this.organisationRepository.getOrganisationByIdOrFail(organisationId)
      const organisationUsers = await this.organisationUserRepository.getAllOrganisationUsers(organisationId)

      const results = {
        organisation: organisation.getValue(),
        users: organisationUsers.map(organisationUser => organisationUser.getValue()),
      }

      return results
    } catch (error) {
      throw new Error(`Error getting organisation details: ${error}`)
    }
  }


  public async getAllOrganisations(userId: string) {
    try {
      /**@todo  need to add rule to only allow organisation user to get organisation details */
      const organisations = await this.organisationRepository.getAllOrganisations()
      return organisations.map(organisation => organisation.getValue())
    } catch (error) {
      throw new Error(`Error getting all organisations: ${error}`)
    }
  }
}