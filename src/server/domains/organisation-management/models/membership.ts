import { pgRolesEnum } from '~/server/db/schema';
import { type User } from "../../user-management/models/user";
import { type Organisation } from "./organisation";

/**@see {@link pgRolesEnum} */
export enum MEMBERSHIP_ROLE_ENUM {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}
interface MembershipProps {
  id: string;
  organisationId: Organisation['props']['id'];
  userId: User['props']['id'];
  role: MEMBERSHIP_ROLE_ENUM;
  createdAt: Date;
  updatedAt: Date;
}

export class Membership {
  constructor(private readonly props: MembershipProps) {}

  public getValue() {
    return this.props;
  }
}