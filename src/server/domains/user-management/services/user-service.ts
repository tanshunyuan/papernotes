import { clerkClient } from "@clerk/nextjs/server";
import { User, USER_PLAN_ENUM } from "../models/user";
import { ProjectResourceLimits } from "../../authorisation/utils/resource-limits";
import { type UserRepository } from "../repo/user-repository";
import { type MembershipRepository } from "../../organisation-management/repo/membership-repository";
import { type ProjectRepository } from "../../project-management/repo/project-repository";
import { type OrganisationResourceLimitsRepository } from "../../organisation-management/repo/organisation-resource-limits-repository";
import { type OrganisationRepository } from "../../organisation-management/repo/organisation-repository";
import { type OrganisationTeamMemberRepository } from '../../organisation-management/repo/organisation-team-member-repository';
import { MEMBERSHIP_ROLE_ENUM, Membership } from "../../organisation-management/models/membership";
import { PLAN_BASED_ROLE_PERMISSION } from "../../authorisation/utils/permissions";
import { Organisation, ORGANISATION_TYPE_ENUM } from "../../organisation-management/models/organisation";
import { uuid } from "uuidv4";

export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly organisationRepo: OrganisationRepository,
    private readonly membershipRepo: MembershipRepository,
    private readonly organisationResourceLimitsRepo: OrganisationResourceLimitsRepository,
    private readonly organisationTeamMemberRepo: OrganisationTeamMemberRepository,
  ) { }

  public async registerExistingClerkUser(userId: string) {
    try {
      const existingUser = await this.userRepo.getUserByIdOrNull(userId)
      if (existingUser) return null

      const clerkUser = await clerkClient.users.getUser(userId)
      const fullname = `${clerkUser.firstName} ${clerkUser.lastName}`

      const user = new User({
        id: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        name: fullname,
        /**@todo learn how to hide this in the class */
        userPlan: USER_PLAN_ENUM.FREE
      })

      const organisationId = uuid()

      const personalOrganisation = new Organisation({
        name: 'Personal Organisation',
        description: `${fullname}'s personal organisation`,
        id: organisationId,
        createdAt: new Date(),
        maxSeats: 1,
        planDurationStart: new Date(),
        planDurationEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 90)),
        updatedAt: new Date(),
        type: ORGANISATION_TYPE_ENUM.PERSONAL
      })

      const userMembership = new Membership({
        id: uuid(),
        organisationId,
        userId,
        role: MEMBERSHIP_ROLE_ENUM.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
        isCurrent: true
      })

      await this.userRepo.save(user)
      await this.organisationRepo.save(personalOrganisation)
      await this.membershipRepo.save(userMembership)

    } catch (error) {
      throw new Error(`Error registering user: ${error}`)
    }
  }

  public async getUserDetails(userId: string) {
    const user = await this.userRepo.getUserByIdOrFail(userId)

    if (user.getValue().userPlan === USER_PLAN_ENUM.FREE) {
      return {
        id: user.getValue().id,
        email: user.getValue().email,
        name: user.getValue().name,
        plan: user.getValue().userPlan
      }
    }

    if (user.getValue().userPlan === USER_PLAN_ENUM.ENTERPRISE) {
      const membership = await this.membershipRepo.getMembershipByUserIdOrFail(userId)
      const organisation = await this.organisationRepo.getOrganisationByIdOrFail(membership.organisationId)
      const organisationTeamMemberInfo = await this.organisationTeamMemberRepo.getTeamMemberByMembershipIdOrNull({
        membershipId: membership.id,
      })
      if (membership.role === MEMBERSHIP_ROLE_ENUM.ADMIN) {
        return {
          id: user.getValue().id,
          email: user.getValue().email,
          name: user.getValue().name,
          plan: user.getValue().userPlan,
          organisation: {
            id: organisation.getValue().id,
            name: organisation.getValue().name,
            teamName: organisationTeamMemberInfo?.teamName ?? null,
            teamId: organisationTeamMemberInfo?.organisationTeamId ?? null,
          },
          permissions: PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.ADMIN
        }
      }

      if (membership.role === MEMBERSHIP_ROLE_ENUM.MEMBER) {
        return {
          id: user.getValue().id,
          email: user.getValue().email,
          name: user.getValue().name,
          plan: user.getValue().userPlan,
          organisation: {
            id: organisation.getValue().id,
            name: organisation.getValue().name,
            teamName: organisationTeamMemberInfo?.teamName ?? null,
            teamId: organisationTeamMemberInfo?.organisationTeamId ?? null,
          },
          permissions: PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.MEMBER
        }
      }
    }
  }

  public async getUserResourceLimits(userId: string) {
    try {
      const user = await this.userRepo.getUserByIdOrFail(userId)

      if (user.getValue().userPlan === USER_PLAN_ENUM.FREE) {
        const projectCount = await this.projectRepo.getProjectCountOrNullByUserId(userId) ?? 0

        return {
          resource: {
            projects: {
              quota: ProjectResourceLimits.MAX_PROJECTS_PER_USER,
              used: projectCount,
              remaining: Math.max(0, ProjectResourceLimits.MAX_PROJECTS_PER_USER - projectCount)
            }
          }
        }
      }

      if (user.getValue().userPlan === USER_PLAN_ENUM.ENTERPRISE) {
        const projectCount = await this.projectRepo.getProjectCountOrNullByUserId(userId) ?? 0
        const Membership = await this.membershipRepo.getMembershipByUserIdOrFail(userId)
        const organisationResourceLimits = await this.organisationResourceLimitsRepo.getResourceLimitsByOrganisationIdOrFail(Membership.organisationId)

        const { configuration } = organisationResourceLimits.getValue()
        return {
          resource: {
            projects: {
              quota: configuration.resources.project.limit,
              used: projectCount,
              remaining: Math.max(0, configuration.resources.project.limit - projectCount)
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Error getting user details: ${error}`)
    }
  }
}