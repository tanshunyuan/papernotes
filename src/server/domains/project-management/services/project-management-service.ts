import { PLAN_BASED_ROLE_PERMISSION, PROJECT_PERIMSSIONS } from './../../authorisation/utils/permissions';
import { ProjectRepository } from "../repo/project-repository";
import { AuthorisationService } from '../../authorisation/services/authorisation-service';
import { Project } from '../models/project';
import { uuid } from 'uuidv4';
import { ProjectResourceLimits } from '../../authorisation/utils/resource-limits';
import { UserRepository } from '../../user-management/repo/user-repository';
import { OrganisationUserRepository } from '../../organisation-management/repo/organisation-user-repository';
import { USER_PLAN_ENUM } from '../../user-management/models/user';
import { ORGANISATION_ROLE_ENUM } from '../../organisation-management/models/organisation-user';
import { OrganisationResourceLimitsRepository } from '../../organisation-management/repo/organisation-resource-limits-repository';
import { OrganisationTeamUserRepository } from '../../organisation-management/repo/organisation-team-user-repository';

// food for thought, currently using read_all permission to get all projects is ok when there's no organisation structure.
// But if there is, it'll bit a tad more complicated to implement.
export class ProjectManagementService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly userRepo: UserRepository,
    private readonly organisationUserRepo: OrganisationUserRepository,
    private readonly organisationResourceLimitsRepo: OrganisationResourceLimitsRepository,
    private readonly organisationTeamUserRepo: OrganisationTeamUserRepository,
    private readonly authService: AuthorisationService
  ) { }

  // public async createProject(userId: string, name: string, description: string) {
  public async createProject(args: {
    userId: string,
    name: string,
    description: string,
    teamId: string | null
  }) {
    /**@warning it wont work if user has multiple membership to different organisations */
    try {
      const userDetails = await this.userRepo.getUserByIdOrFail(args.userId)
      console.log({ userDetails })
      const userMembership = await this.organisationUserRepo.getOrganisationUserByUserIdOrFail(args.userId)
      console.log({ userMembership })
      const projectCount = await this.projectRepo.getProjectCountOrNullByUserId(args.userId) ?? 0
      console.log({ projectCount })

      console.log('ProjectManagementService.createProject', {
        projectCount
      })

      if (userDetails.getValue().plan === USER_PLAN_ENUM.FREE) {
        if (projectCount >= ProjectResourceLimits.MAX_PROJECTS_PER_USER) {
          throw new Error('You have reached the maximum number of projects you can create')
        }
        /**@todo figure out another way to handle this */
        const project = new Project({
          id: uuid(),
          name: args.name,
          userId: args.userId,
          description: args.description,
          organisationId: userMembership!.organisationId,
          organisationTeamId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        })
        console.log('ProjectManagementService.createProject.project', {
          details: project.getValue()
        })
        await this.projectRepo.save(project)
      }

      if (userDetails.getValue().plan === USER_PLAN_ENUM.ENTERPRISE) {
        const organisationResourceLimits = await this.organisationResourceLimitsRepo.getResourceLimitsByOrganisationIdOrFail(userMembership.organisationId)
        if (projectCount >= organisationResourceLimits?.getValue().configuration.resources.project.limit) {
          throw new Error('You have reached the maximum number of projects you can create')
        }
        const project = new Project({
          id: uuid(),
          name: args.name,
          userId: args.userId,
          description: args.description,
          organisationId: userMembership!.organisationId,
          organisationTeamId: args.teamId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        })
        console.log('ProjectManagementService.createProject.project', {
          details: project.getValue()
        })
        await this.projectRepo.save(project)
      }

    } catch (error) {
      throw new Error(`Error creating project: ${error}`)
    }
  }

  /**@todo figure out is it even get project by user id when people are in a organisation and team */
  public async getProjectsByUserId(userId: string) {
    try {
      const user = await this.userRepo.getUserByIdOrFail(userId)

      if (user.getValue().plan === USER_PLAN_ENUM.FREE) {
        const projects = (await this.projectRepo.getProjectsByUserId(userId)).map(project => ({
          ...project.getValue(),
          permissions: PLAN_BASED_ROLE_PERMISSION.FREE
        }))
        return projects
      }

      if (user.getValue().plan === USER_PLAN_ENUM.ENTERPRISE) {
        const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrNull(user.getValue().id)
        if (organisationUser?.role === ORGANISATION_ROLE_ENUM.ADMIN) {
          const allProjects = (await this.projectRepo.getAllOrganisationProjects(organisationUser.organisationId)).map(project => {
            return {
              ...project.getValue(),
              permissions: project.getValue().userId === userId ? PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.ADMIN : null
            }
          })
          return allProjects
        }

        if (organisationUser?.role === ORGANISATION_ROLE_ENUM.MEMBER) {
          // If you're part of a team retrieve all projects for that team
          // else retrieve all projects for that user


          const organisationTeamUser = await this.organisationTeamUserRepo.getTeamUserByOrganisationUserIdOrNull({
            organisationUserId: organisationUser.id
          })

          if (!organisationTeamUser) {
            // not in a team
            const projects = (await this.projectRepo.getProjectsByUserId(userId)).map(project => ({
              ...project.getValue(),
              permissions: PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.MEMBER
            }))
            return projects
          } else {
            // in a team
            const projects = (await this.projectRepo.getAllOrganisationTeamProjects({
              orgTeamId: organisationTeamUser.organisationTeamId
            })).map(project => ({
              ...project.getValue(),
              permissions: project.getValue().userId === userId ? PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.MEMBER : null
            }))

            return projects
          }
        }

        throw new Error('User is not on any plan')
      }
    }

    catch (error) {
      throw new Error(`Error getting projects by user id: ${error}`)
    }
  }


  public async updateProject(userId: string, projectId: string, name: string, description: string) {
    try {
      const project = await this.projectRepo.getProjectByIdOrFail(projectId)
      if (!project) {
        throw new Error('Project not found')
      }

      // interesting, other than this how can we check perform this check through the permissions
      if (project.getValue().userId !== userId) {
        throw new Error('You do not have permission to perform this operation')
      }

      project.getValue().name = name
      project.getValue().description = description

      await this.projectRepo.update(project)
    } catch (error) {
      throw new Error(`Error updating project: ${error}`)
    }
  }

  public async deleteProject(userId: string, projectId: string) {
    try {
      const project = await this.projectRepo.getProjectByIdOrFail(projectId)
      if (!project) {
        throw new Error('Project not found')
      }

      // interesting, other than this how can we check perform this check through the permissions
      if (project.getValue().userId !== userId) {
        throw new Error('You do not have permission to perform this operation')
      }

      await this.projectRepo.delete(projectId)
    } catch (error) {
      throw new Error(`Error deleting project: ${error}`)
    }
  }

}