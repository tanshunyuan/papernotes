import { OrganisationUserRepository } from './organisation-user-repository';
import { dbService } from "~/server/db";
import { OrganisationRepository } from "./organisation-repository";
import { OrganisationResourceLimitsRepository } from './organisation-resource-limits-repository';

export const organisationRepository = new OrganisationRepository(dbService);
export const organisationUserRepository = new OrganisationUserRepository(dbService);
export const organisationResourceLimitsRepository = new OrganisationResourceLimitsRepository(dbService);