import { OrganisationTeamManagementService } from './organisation-team-management-service';
import { userRepository } from "../../user-management/repo";
import { organisationRepository, organisationResourceLimitsRepository, organisationTeamRepository, membershipRepository, organisationTeamMemberRepository } from "../repo";
import { OrganisationManagementService } from "./organisation-management-service";

export const organisationManagementService = new OrganisationManagementService(
  userRepository,
  organisationRepository,
  membershipRepository,
  organisationResourceLimitsRepository
)

export const organisationTeamManagementService = new OrganisationTeamManagementService(
  organisationRepository,
  membershipRepository,
  organisationTeamRepository,
  organisationTeamMemberRepository
)