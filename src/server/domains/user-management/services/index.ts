import { organisationRepository, organisationResourceLimitsRepository, organisationUserRepository } from "../../organisation-management/repo";
import { projectRepository } from "../../project-management/repo";
import { userRepository } from "../repo";
import { UserService } from "./user-service";

export const userService = new UserService(userRepository, projectRepository, organisationRepository, organisationUserRepository, organisationResourceLimitsRepository)