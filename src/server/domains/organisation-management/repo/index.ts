import { OrganisationTeamMemberRepository } from './organisation-team-member-repository';
import { OrganisationTeamRepository } from './organisation-team-repository';
import { MembershipRepository } from './membership-repository';
import { dbService } from "~/server/db";
import { OrganisationRepository } from "./organisation-repository";
import { OrganisationResourceLimitsRepository } from './organisation-resource-limits-repository';

export const organisationRepository = new OrganisationRepository(dbService);
export const membershipRepository = new MembershipRepository(dbService);
export const organisationResourceLimitsRepository = new OrganisationResourceLimitsRepository(dbService);
export const organisationTeamRepository = new OrganisationTeamRepository(dbService);
export const organisationTeamMemberRepository = new OrganisationTeamMemberRepository(dbService)