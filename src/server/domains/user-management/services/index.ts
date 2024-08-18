import { organisationRepository, organisationResourceLimitsRepository, organisationTeamMemberRepository, membershipRepository } from "../../organisation-management/repo";
import { projectRepository } from "../../project-management/repo";
import { userRepository } from "../repo";
import { UserService } from "./user-service";

export const userService = new UserService(
  userRepository, 
  projectRepository, 
  organisationRepository, 
  membershipRepository, 
  organisationResourceLimitsRepository,
  organisationTeamMemberRepository
)