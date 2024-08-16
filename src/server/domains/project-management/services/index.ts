import { authorisationService } from "../../authorisation/services";
import { organisationResourceLimitsRepository, organisationTeamUserRepository, organisationUserRepository } from "../../organisation-management/repo";
import { userRepository } from "../../user-management/repo";
import { projectRepository } from "../repo";
import { ProjectManagementService } from "./project-management-service";


export const projectManagementService = new ProjectManagementService(
  projectRepository,
  userRepository,
  organisationUserRepository,
  organisationResourceLimitsRepository,
  organisationTeamUserRepository,
  authorisationService
)