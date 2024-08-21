import { uuid } from "uuidv4";
import { Organisation, ORGANISATION_TYPE_ENUM } from "../models/organisation";
import { OrganisationRepository } from "../repo/organisation-repository";
import { MembershipRepository } from "../repo/membership-repository";
import { MEMBERSHIP_ROLE_ENUM, Membership } from "../models/membership";
import { clerkClient } from '@clerk/nextjs/server';
import { User, USER_PLAN_ENUM } from "../../user-management/models/user";
import { UserRepository } from "../../user-management/repo/user-repository";
import { OrganisationResourceLimitsRepository } from '../repo/organisation-resource-limits-repository';
import { OrganisationResourceLimits } from "../models/organisation-resource-limits";
import { DbService } from "~/server/db";


interface UpdateMembershipRoleArgs {
  currentUserId: string;
  MembershipId: string;
  role: MEMBERSHIP_ROLE_ENUM;
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
    private readonly dbService: DbService,
    private readonly userRepository: UserRepository,
    private readonly organisationRepository: OrganisationRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly organisationResourceLimitsRepository: OrganisationResourceLimitsRepository
  ) { }

  /**
   * @description create an org by employees
   */
  public async createOrganisation(args: {
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
  }) {
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
        updatedAt: new Date(),
        type: ORGANISATION_TYPE_ENUM.COMPANY
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

      await this.dbService.getQueryClient().transaction(async (tx) => {
        await this.organisationRepository.save(organisation, tx)
        await this.organisationResourceLimitsRepository.save(organisationResourceLimits, tx);
      })
    } catch (error) {
      throw new Error(`Error creating organisation: ${error}`)
    }
  }

  public async addANewUserToOrganisation(args: {
    organisationId: string;
    /**@description authenticated user id */
    currentUserId: string
    data: {
      email: string
      password: string
      firstName: string
      lastName: string
    },
    memberType: MEMBERSHIP_ROLE_ENUM
  }) {
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

      const user = User.createEnterpriseUser({
        id: clerkUser.id,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
      })

      const membership = new Membership({
        id: uuid(),
        organisationId,
        userId: user.getValue().id,
        createdAt: new Date(),
        updatedAt: new Date(),
        /**@todo to change this into dynamic */
        role: args.memberType,
        isCurrent: true
      })

      await this.userRepository.save(user)
      await this.membershipRepository.save(membership)

    } catch (error) {
      throw new Error(`Error creating organisation user: ${error}`)
    }
  }

  /**@todo might want to consider adding a fn to centralise updates to organisation */
  public async updateMembershipRole(args: UpdateMembershipRoleArgs) {
    const { currentUserId, MembershipId, role } = args
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      if (!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation')

      const membership = await this.membershipRepository.getMembershipByIdOrFail(MembershipId)
      const updatedMembership = new Membership({
        ...membership.getValue(),
        role,
      })
      await this.membershipRepository.updateMembershipRole(updatedMembership)
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


  /**@description allow both org and employees to query information */
  public async getOrganisationDetails(organisationId: string, currentUserId: string) {
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      const membership = await this.membershipRepository.getMembershipByUserIdOrNull(currentUserId)

      if (!currentUser.isEmployee() && !membership) throw new Error('You do not have permission to perform this operation')

      const organisation = await this.organisationRepository.getOrganisationByIdOrFail(organisationId)
      const memberships = await this.membershipRepository.getAllMemberships(organisationId)
      const organisationResourceLimits = await this.organisationResourceLimitsRepository.getResourceLimitsByOrganisationIdOrNull(organisationId)

      const results = {
        organisation: organisation.getValue(),
        users: memberships,
        resourceLimits: organisationResourceLimits?.getValue() ?? null
      }

      return results
    } catch (error) {
      throw new Error(`Error getting organisation details: ${error}`)
    }
  }


  public async getAllOrganisations(currentUserId: string) {
    try {
      const currentUser = await this.userRepository.getUserByIdOrFail(currentUserId);
      if (!currentUser.isEmployee()) throw new Error('You do not have permission to perform this operation')

      const organisations = await this.organisationRepository.getAllOrganisations({ organisationType: ORGANISATION_TYPE_ENUM.COMPANY })
      return organisations.map(organisation => organisation.getValue())
    } catch (error) {
      throw new Error(`Error getting all organisations: ${error}`)
    }
  }
}