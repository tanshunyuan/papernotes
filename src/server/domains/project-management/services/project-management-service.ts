import { PROJECT_PERIMSSIONS, ROLE_PERMISSIONS } from './../../authorisation/utils/permissions';
import { USER_ROLE_ENUM } from "../../user-management/models/user";
import { UserRepository } from "../../user-management/repo/user-repository";
import { ProjectRepository } from "../repo/project-repository";

// food for thought, currently using read_all permission to get all projects is ok when there's no organisation structure.
// But if there is, it'll bit a tad more complicated to implement.
export class ProjectManagementService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly userRepo: UserRepository) { }

  public async getProjectsByUserId(userId: string) {
    try {
      const user = await this.userRepo.getUserByIdOrFail(userId)
      if (user.getValue().role === USER_ROLE_ENUM.ADMIN) {
        if (ROLE_PERMISSIONS[user.getValue().role].includes(PROJECT_PERIMSSIONS.READ_ALL)) {
          const allProjects = (await this.projectRepo.getAllProjects()).map(project => project.getValue())
          return allProjects
        }
      }

      if (user.getValue().role === USER_ROLE_ENUM.MEMBER) {
        if (ROLE_PERMISSIONS[user.getValue().role].includes(PROJECT_PERIMSSIONS.READ_OWN)) {
          const userProjects = (await this.projectRepo.getProjectsByUserId(userId)).map(project => project.getValue())
          return userProjects
        }
      }

      throw new Error('You do not have permission to perform this operation')

    } catch (error) {
      throw new Error(`Error getting projects by user id: ${error}`)
    }
  }
}