import { PROJECT_PERIMSSIONS, ROLE_PERMISSIONS } from './../../authorisation/utils/permissions';
import { ProjectRepository } from "../repo/project-repository";
import { AuthorisationService } from '../../authorisation/services/authorisation-service';
import { Project } from '../models/project';
import { uuid } from 'uuidv4';
import { ProjectResourceLimits } from '../../authorisation/utils/resource-limits';

// food for thought, currently using read_all permission to get all projects is ok when there's no organisation structure.
// But if there is, it'll bit a tad more complicated to implement.
export class ProjectManagementService {
  constructor(
    private readonly projectRepo: ProjectRepository,
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

  // public async getProjectsByUserId(userId: string) {
  //   try {
  //     const canReadAll = await this.authService.canPerformOperation(userId, PROJECT_PERIMSSIONS.READ_ALL);
  //     if (canReadAll) {
  //       const allProjects = (await this.projectRepo.getAllProjects()).map(project => {
  //         const value = project.getValue()
  //         const permissions = value.userId === userId ? ROLE_PERMISSIONS.ADMIN : undefined
  //         return {
  //           ...value,
  //           permissions
  //         }
  //       })
  //       return allProjects
  //     }

  //     const canReadOwn = await this.authService.canPerformOperation(userId, PROJECT_PERIMSSIONS.READ_OWN);
  //     if (canReadOwn) {
  //       const userProjects = (await this.projectRepo.getProjectsByUserId(userId)).map(project => {
  //         const value = project.getValue()
  //         const permissions = value.userId === userId ? ROLE_PERMISSIONS.MEMBER : undefined
  //         return {
  //           ...value,
  //           permissions
  //         }
  //       })
  //       return userProjects
  //     }

  //     throw new Error('You do not have permission to perform this operation')

  //   } catch (error) {
  //     throw new Error(`Error getting projects by user id: ${error}`)
  //   }
  // }

  public async getProjectsByUserId(userId: string) {
    try {
      const userProjects = (await this.projectRepo.getProjectsByUserId(userId)).map(project => project.getValue())
      return userProjects
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