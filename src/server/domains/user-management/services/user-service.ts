import { clerkClient } from "@clerk/nextjs/server";
import { User, USER_PLAN_ENUM } from "../models/user";
import { UserRepository } from "../repo/user-repository";
import { OrganisationUserRepository } from "../../organisation-management/repo/organisation-user-repository";
import { ProjectResourceLimits } from "../../authorisation/utils/resource-limits";
import { ProjectRepository } from "../../project-management/repo/project-repository";
import { OrganisationResourceLimitsRepository } from "../../organisation-management/repo/organisation-resource-limits-repository";
import { OrganisationRepository } from "../../organisation-management/repo/organisation-repository";

export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly organisationRepo: OrganisationRepository,
    private readonly organisationUserRepo: OrganisationUserRepository,
    private readonly organisationResourceLimitsRepo: OrganisationResourceLimitsRepository
  ) { }

  public async registerExistingClerkUser(userId: string) {
    try {
      const existingUser = await this.userRepo.getUserByIdOrNull(userId)
      if (existingUser) return null

      const clerkUser = await clerkClient.users.getUser(userId)

      const user = new User({
        id: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        /**@todo learn how to hide this in the class */
        plan: USER_PLAN_ENUM.FREE
      })

      await this.userRepo.save(user)
    } catch (error) {
      throw new Error(`Error registering user: ${error}`)
    }
  }

  public async getUserDetails(userId: string) {
    const user = await this.userRepo.getUserByIdOrFail(userId)

    if (user.getValue().plan === USER_PLAN_ENUM.FREE) {
      return {
        email: user.getValue().email,
        name: user.getValue().name,
        plan: user.getValue().plan
      }
    }

    if (user.getValue().plan === USER_PLAN_ENUM.ENTERPRISE) {
      const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrFail(userId)
      const organisation = await this.organisationRepo.getOrganisationByIdOrFail(organisationUser.getValue().organisationId)

      return {
        email: user.getValue().email,
        name: user.getValue().name,
        plan: user.getValue().plan,
        organisation: {
          name: organisation.getValue().name,
        }
      }
    }
  }

  public async getUserResourceLimits(userId: string) {
    try {
      const user = await this.userRepo.getUserByIdOrFail(userId)

      if (user.getValue().plan === USER_PLAN_ENUM.FREE) {
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

      if (user.getValue().plan === USER_PLAN_ENUM.ENTERPRISE) {
        const projectCount = await this.projectRepo.getProjectCountOrNullByUserId(userId) ?? 0
        const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrFail(userId)
        const organisationResourceLimits = await this.organisationResourceLimitsRepo.getResourceLimitsByOrganisationIdOrFail(organisationUser.getValue().organisationId)

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