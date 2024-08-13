import { pgRolesEnum } from '~/server/db/schema';
import { type User } from "../../user-management/models/user";
import { type Organisation } from "./organisation";

/**@see {@link pgRolesEnum} */
export enum ORGANISATION_ROLE_ENUM {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}
interface OrganisationUserProps {
  id: string;
  organisationId: Organisation['props']['id'];
  userId: User['props']['id'];
  role: ORGANISATION_ROLE_ENUM;
  createdAt: Date;
  updatedAt: Date;
}

export class OrganisationUser {
  constructor(private readonly props: OrganisationUserProps) {}

  public getValue() {
    return this.props;
  }
}