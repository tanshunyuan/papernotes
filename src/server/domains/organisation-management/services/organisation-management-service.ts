import { uuid } from "uuidv4";
import { Organisation } from "../models/organisation";
import { OrganisationRepository } from "../repo/organisation-repository";
import { OrganisationUserRepository } from "../repo/organisation-user-repository";
import { OrganisationUser } from "../models/organisation-user";
import { clerkClient } from '@clerk/nextjs/server';
import { User, USER_PLAN_ENUM } from "../../user-management/models/user";
import { UserRepository } from "../../user-management/repo/user-repository";

interface CreateOrganisationArgs {
  userId: string;
  name: string;
  description: string;
  planDurationStart: Date;
  planDurationEnd: Date;
  maxSeats: number;
}

interface AddAUserToOrganisationArgs {
  organisationId: string;
  /**@description authenticated user id */
  currentUserId: string
  data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }
}
export class OrganisationManagementService {
  constructor(
    private readonly userRepository: UserRepository,
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

  /**@todo might need to check if the clerk account has been created or not */
  public async addANewUserToOrganisation(args: AddAUserToOrganisationArgs) {
    const { organisationId, currentUserId, data } = args
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      if(!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation')

      await this.organisationRepository.getOrganisationByIdOrFail(organisationId)

      const clerkUser = await clerkClient.users.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        emailAddress: [data.email]
      })

      const user = new User({
        id: clerkUser.id,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        /**@todo learn how to hide this in the class */
        plan: USER_PLAN_ENUM.ENTERPRISE
      })

      const organisationUser = new OrganisationUser({
        id: uuid(),
        organisationId,
        userId: user.getValue().id,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await this.userRepository.save(user)
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