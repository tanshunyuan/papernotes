import { PLAN_BASED_ROLE_PERMISSION, PROJECT_PERIMSSIONS } from './../../authorisation/utils/permissions';
import { ProjectRepository } from "../repo/project-repository";
import { AuthorisationService } from '../../authorisation/services/authorisation-service';
import { Project } from '../models/project';
import { uuid } from 'uuidv4';
import { ProjectResourceLimits } from '../../authorisation/utils/resource-limits';
import { UserRepository } from '../../user-management/repo/user-repository';
import { OrganisationUserRepository } from '../../organisation-management/repo/organisation-user-repository';

// food for thought, currently using read_all permission to get all projects is ok when there's no organisation structure.
// But if there is, it'll bit a tad more complicated to implement.
export class ProjectManagementService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly userRepo: UserRepository,
    private readonly organisationUserRepo: OrganisationUserRepository,
    private readonly authService: AuthorisationService
  ) { }

  public async createProject(userId: string, name: string, description: string) {
    try {
      const projectCount = await this.projectRepo.getProjectCountOrNullByUserId(userId) ?? 0

      if (projectCount >= ProjectResourceLimits.MAX_PROJECTS_PER_USER) {
        throw new Error('You have reached the maximum number of projects you can create')
      }

      const project = new Project({
        id: uuid(),
        name,
        userId: userId,
        description,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log('ProjectManagementService.createProject.project', {
        details: project.getValue()
      })
      await this.projectRepo.save(project)
    } catch (error) {
      throw new Error(`Error creating project: ${error}`)
    }
  }

  public async getProjectsByUserId(userId: string) {
    try {
      const user = await this.userRepo.getUserByIdOrFail(userId)

      if (user.getValue().plan === 'FREE') {
        const projects = (await this.projectRepo.getProjectsByUserId(userId)).map(project => ({
          ...project.getValue(),
          permissions: PLAN_BASED_ROLE_PERMISSION.FREE
        }))
        return projects
      }

      if (user.getValue().plan === 'ENTERPRISE') {
        const organisationUser = await this.organisationUserRepo.getOrganisationUserByUserIdOrNull(user.getValue().id)
        if (organisationUser?.getValue().role === 'ADMIN') {
          /**@todo change this to grab project belonging to a ORG, currently it'll grab ALL regardless */
          const allProjects = (await this.projectRepo.getAllOrganisationProjects(organisationUser.getValue().organisationId)).map(project => {
            return {
              ...project.getValue(),
              permissions: project.getValue().userId === userId ? PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.ADMIN : null
            }
          })
          return allProjects
        }

        if (organisationUser?.getValue().role === 'MEMBER') {
          const projects = (await this.projectRepo.getProjectsByUserId(userId)).map(project => ({
            ...project.getValue(),
            permissions: PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.MEMBER
          }))
          return projects
        }

        throw new Error('User is not a member of an organisation')
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