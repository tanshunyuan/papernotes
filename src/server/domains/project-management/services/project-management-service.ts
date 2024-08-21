import { PLAN_BASED_ROLE_PERMISSION, PROJECT_PERIMSSIONS } from './../../authorisation/utils/permissions';
import { type ProjectRepository } from "../repo/project-repository";
import { type AuthorisationService } from '../../authorisation/services/authorisation-service';
import { Project } from '../models/project';
import { uuid } from 'uuidv4';
import { ProjectResourceLimits } from '../../authorisation/utils/resource-limits';
import { type UserRepository } from '../../user-management/repo/user-repository';
import { type MembershipRepository } from '../../organisation-management/repo/membership-repository';
import { USER_PLAN_ENUM } from '../../user-management/models/user';
import { MEMBERSHIP_ROLE_ENUM } from '../../organisation-management/models/membership';
import { type OrganisationResourceLimitsRepository } from '../../organisation-management/repo/organisation-resource-limits-repository';
import { type OrganisationTeamMemberRepository } from '../../organisation-management/repo/organisation-team-member-repository';

// food for thought, currently using read_all permission to get all projects is ok when there's no organisation structure.
// But if there is, it'll bit a tad more complicated to implement.
export class ProjectManagementService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly userRepo: UserRepository,
    private readonly membershipRepo: MembershipRepository,
    private readonly organisationResourceLimitsRepo: OrganisationResourceLimitsRepository,
    private readonly organisationTeamMemberRepo: OrganisationTeamMemberRepository,
    private readonly authService: AuthorisationService
  ) { }

  public async createProject(args: {
    userId: string,
    name: string,
    description: string,
    teamId: string | null
  }) {
    try {
      const userDetails = await this.userRepo.getUserByIdOrFail(args.userId)
      const userMembership = await this.membershipRepo.getMembershipByUserIdOrFail(args.userId)
      const projectCount = await this.projectRepo.getProjectCountOrNullByUserId(args.userId) ?? 0

      console.log('ProjectManagementService.createProject', {
        projectCount
      })

      const project = new Project({
        id: uuid(),
        name: args.name,
        userId: args.userId,
        description: args.description,
        organisationId: userMembership.organisationId,
        organisationTeamId: userDetails.getValue().userPlan === USER_PLAN_ENUM.ENTERPRISE ? args.teamId : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      });

      let maxProjects: number;

      if (userDetails.getValue().userPlan === USER_PLAN_ENUM.FREE) {
        maxProjects = ProjectResourceLimits.MAX_PROJECTS_PER_USER;
      } else {
        const organisationResourceLimits = await this.organisationResourceLimitsRepo.getResourceLimitsByOrganisationIdOrFail(userMembership.organisationId);
        maxProjects = organisationResourceLimits?.getValue().configuration.resources.project.limit;
      }

      if (projectCount >= maxProjects) {
        throw new Error('You have reached the maximum number of projects you can create');
      }

      console.log('ProjectManagementService.createProject.project', {
        details: project.getValue()
      })

      await this.projectRepo.save(project)
    } catch (error) {
      throw new Error(`Error creating project: ${error}`)
    }
  }

  public async getUserProjects(args: { userId: string }) {
    try {

      const user = await this.userRepo.getUserByIdOrFail(args.userId)
      const userMembership = await this.membershipRepo.getMembershipByUserIdOrFail(args.userId)

      console.log('getUserProjects.userMembership', {
        details: userMembership
      })

      if (user.getValue().userPlan === USER_PLAN_ENUM.FREE) {
        const projects = (await this.projectRepo.getProjectsByOrganisationIdAndUserId({
          orgId: userMembership.organisationId,
          userId: args.userId
        })).map(project => ({
          ...project.getValue(),
          permissions: PLAN_BASED_ROLE_PERMISSION.FREE
        }))
        return projects
      }

      if (user.getValue().userPlan === USER_PLAN_ENUM.ENTERPRISE) {
        if (userMembership?.role === MEMBERSHIP_ROLE_ENUM.ADMIN) {
          const allProjects = (await this.projectRepo.getAllOrganisationProjects({ orgId: userMembership.organisationId })).map(project => {
            return {
              ...project.getValue(),
              permissions: project.getValue().userId === args.userId ? PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.ADMIN : null
            }
          })
          return allProjects
        }

        if (userMembership?.role === MEMBERSHIP_ROLE_ENUM.MEMBER) {
          const organisationTeamMember = await this.organisationTeamMemberRepo.getTeamMemberByMembershipIdOrNull({
            membershipId: userMembership.id
          })
          console.log('getUserProjects.if.ENTERPRISE.if.MEMBER.organisationTeamMember', {
            details: organisationTeamMember
          })

          if (!organisationTeamMember) {
            // not in a team
            const projects = (await this.projectRepo.getProjectsByOrganisationIdAndUserId({ orgId: userMembership.organisationId, userId: args.userId })).map(project => ({
              ...project.getValue(),
              permissions: PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.MEMBER
            }))
            console.log('getUserProjects.if.ENTERPRISE.if.MEMBER.projects', {
              details: projects
            })
            return projects
          } else {
            // in a team
            const projects = (await this.projectRepo.getAllOrganisationTeamProjects({
              orgTeamId: organisationTeamMember.organisationTeamId
            })).map(project => ({
              ...project.getValue(),
              permissions: project.getValue().userId === args.userId ? PLAN_BASED_ROLE_PERMISSION.ENTERPRISE.MEMBER : null
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