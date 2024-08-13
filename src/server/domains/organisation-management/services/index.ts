import { OrganisationTeamManagementService } from './organisation-team-management-service';
import { userRepository } from "../../user-management/repo";
import { organisationRepository, organisationResourceLimitsRepository, organisationTeamRepository, organisationTeamUserRepository, organisationUserRepository } from "../repo";
import { OrganisationManagementService } from "./organisation-management-service";

export const organisationManagementService = new OrganisationManagementService(
  userRepository,
  organisationRepository,
  organisationUserRepository,
  organisationResourceLimitsRepository
)

export const organisationTeamManagementService = new OrganisationTeamManagementService(
  organisationRepository,
  organisationUserRepository,
  organisationTeamRepository,
  organisationTeamUserRepository
)