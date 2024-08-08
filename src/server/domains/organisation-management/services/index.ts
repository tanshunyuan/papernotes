import { userRepository } from "../../user-management/repo";
import { organisationRepository, organisationUserRepository } from "../repo";
import { OrganisationManagementService } from "./organisation-management-service";

export const organisationManagementService = new OrganisationManagementService(
  userRepository,
  organisationRepository,
  organisationUserRepository
)