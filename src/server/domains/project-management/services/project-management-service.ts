import { PROJECT_PERIMSSIONS, ROLE_PERMISSIONS } from './../../authorisation/utils/permissions';
import { ProjectRepository } from "../repo/project-repository";
import { AuthorisationService } from '../../authorisation/services/authorisation-service';

// food for thought, currently using read_all permission to get all projects is ok when there's no organisation structure.
// But if there is, it'll bit a tad more complicated to implement.
export class ProjectManagementService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly authService: AuthorisationService
) { }

  public async getProjectsByUserId(userId: string) {
    try {

      const canReadAll = await this.authService.canPerformOperation(userId, PROJECT_PERIMSSIONS.READ_ALL);
      if(canReadAll){
          const allProjects = (await this.projectRepo.getAllProjects()).map(project => project.getValue())
          return allProjects
      }

      const canReadOwn = await this.authService.canPerformOperation(userId, PROJECT_PERIMSSIONS.READ_OWN);
      if(canReadOwn){
        const userProjects = (await this.projectRepo.getProjectsByUserId(userId)).map(project => project.getValue())
        return userProjects
      }

      throw new Error('You do not have permission to perform this operation')

    } catch (error) {
      throw new Error(`Error getting projects by user id: ${error}`)
    }
  }

  public async updateProject(projectId: string, name: string, description: string) {
    try {
      const project = await this.projectRepo.getProjectByIdOrFail(projectId)
      if (!project) {
        throw new Error('Project not found')
      }

      // const canUpdate = await this.authService.canPerformOperation(project.userId, PROJECT_PERIMSSIONS.UPDATE)
      // if (!canUpdate) {
      //   throw new Error('You do not have permission to perform this operation')
      // }

      project.getValue().name = name
      project.getValue().description = description

      await this.projectRepo.update(project)
    } catch (error) {
      throw new Error(`Error updating project: ${error}`)
    }
  }
}