import { uuid } from "uuidv4";
import { Organisation } from "../models/organisation";
import { OrganisationRepository } from "../repo/organisation-repository";
import { OrganisationUserRepository } from "../repo/organisation-user-repository";
import { ORGANISATION_ROLE_ENUM, OrganisationUser } from "../models/organisation-user";
import { clerkClient } from '@clerk/nextjs/server';
import { User, USER_PLAN_ENUM } from "../../user-management/models/user";
import { UserRepository } from "../../user-management/repo/user-repository";
import { OrganisationResourceLimitsRepository } from '../repo/organisation-resource-limits-repository';
import { OrganisationResourceLimits } from "../models/organisation-resource-limits";

interface CreateOrganisationArgs {
  /**@description authenticated user id */
  currentUserId: string;
  name: string;
  description: string;
  planDurationStart: Date;
  planDurationEnd: Date;
  maxSeats: number;
  resourceLimits: {
    projectLimit: number;
    projectResetDuration: number;
    featureLimit: number;
  }
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

interface UpdateOrganisationUserRoleArgs {
  currentUserId: string;
  organisationUserId: string;
  role: ORGANISATION_ROLE_ENUM;
}

interface UpdateOrganisationResourceLimitsArgs {
  currentUserId: string;
  organisationId: string;
  projectLimit: number;
  featureLimit: number;
  projectResetDuration: number;
}


export class OrganisationManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organisationRepository: OrganisationRepository,
    private readonly organisationUserRepository: OrganisationUserRepository,
    private readonly organisationResourceLimitsRepository: OrganisationResourceLimitsRepository
  ) { }

  /**@todo need to add fn to add in resource limits & number of seats */
  public async createOrganisation(args: CreateOrganisationArgs) {
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(args.currentUserId);
      if (!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation')

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

      const organisationResourceLimits = new OrganisationResourceLimits({
        id: uuid(),
        orgId: organisation.getValue().id,
        configuration: {
          resources: {
            project: {
              limit: args.resourceLimits.projectLimit,
              reset_duration_days: args.resourceLimits.projectResetDuration
            },
            feature: {
              limit: args.resourceLimits.featureLimit,
              reset_duration_days: null
            }
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      /**@todo wrap in transaction */
      await this.organisationRepository.save(organisation)
      await this.organisationResourceLimitsRepository.save(organisationResourceLimits);
    } catch (error) {
      throw new Error(`Error creating organisation: ${error}`)
    }
  }

  /**@todo might need to check if the clerk account has been created or not */
  public async addANewUserToOrganisation(args: AddAUserToOrganisationArgs) {
    const { organisationId, currentUserId, data } = args
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      if (!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation')

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
        updatedAt: new Date(),
        /**@todo to change this into dynamic */
        role: ORGANISATION_ROLE_ENUM.MEMBER
      })

      await this.userRepository.save(user)
      await this.organisationUserRepository.save(organisationUser)

    } catch (error) {
      throw new Error(`Error creating organisation user: ${error}`)
    }
  }

  /**@todo might want to consider adding a fn to centralise updates to organisation */
  public async updateOrganisationUserRole(args: UpdateOrganisationUserRoleArgs) {
    const { currentUserId, organisationUserId, role } = args
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      if (!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation')

      const organisationUser = await this.organisationUserRepository.getOrganisationUserByIdOrFail(organisationUserId)
      const updatedOrganisationUser = new OrganisationUser({
        ...organisationUser.getValue(),
        role,
      })
      await this.organisationUserRepository.updateOrganisationUserRole(updatedOrganisationUser)
    } catch (error) {
      throw new Error(`Error updating organisation user role: ${error}`)
    }
  }

  public async upsertOrganisationResourceLimits(args: UpdateOrganisationResourceLimitsArgs) {
    const { currentUserId, organisationId, projectLimit, featureLimit, projectResetDuration } = args;
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      if (!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation');

      const organisationResourceLimits = await this.organisationResourceLimitsRepository.getResourceLimitsByOrganisationIdOrNull(organisationId);
      if (!organisationResourceLimits) {
        const configuration = {
          resources: {
            project: {
              limit: projectLimit,
              reset_duration_days: projectResetDuration
            },
            feature: {
              limit: featureLimit,
              reset_duration_days: null
            }
          }
        }
        const organisationResourceLimits = new OrganisationResourceLimits({
          id: uuid(),
          orgId: organisationId,
          configuration,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.organisationResourceLimitsRepository.save(organisationResourceLimits);

      } else {
        const updatedConfiguration = {
          ...organisationResourceLimits.getValue().configuration,
          resources: {
            project: {
              limit: projectLimit,
              reset_duration_days: projectResetDuration
            },
            feature: {
              limit: featureLimit,
              reset_duration_days: null
            }
          }
        };

        const updatedOrganisationResourceLimits = new OrganisationResourceLimits({
          ...organisationResourceLimits.getValue(),
          configuration: updatedConfiguration,
        });

        await this.organisationResourceLimitsRepository.update(updatedOrganisationResourceLimits);
      }

    } catch (error) {
      throw new Error(`Error updating organisation resource limits: ${error}`);
    }
  }


  public async getOrganisationDetails(organisationId: string, currentUserId: string) {
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      if (!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation')

      const organisation = await this.organisationRepository.getOrganisationByIdOrFail(organisationId)
      const organisationUsers = await this.organisationUserRepository.getAllOrganisationUsers(organisationId)
      const organisationResourceLimits = await this.organisationResourceLimitsRepository.getResourceLimitsByOrganisationIdOrNull(organisationId)

      const results = {
        organisation: organisation.getValue(),
        users: organisationUsers,
        resourceLimits: organisationResourceLimits?.getValue() ?? null
      }
      console.log(results)

      return results
    } catch (error) {
      throw new Error(`Error getting organisation details: ${error}`)
    }
  }


  public async getAllOrganisations(currentUserId: string) {
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      if (!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation')

      const organisations = await this.organisationRepository.getAllOrganisations()
      return organisations.map(organisation => organisation.getValue())
    } catch (error) {
      throw new Error(`Error getting all organisations: ${error}`)
    }
  }
}