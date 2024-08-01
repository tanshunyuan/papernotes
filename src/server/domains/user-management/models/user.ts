import { pgRolesEnum } from '~/server/db/schema';

/**@see {@link pgRolesEnum} */
export enum USER_ROLE_ENUM {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

interface UserProps {
  id: string
  email: string
  name: string
  createdAt?: Date
  role: USER_ROLE_ENUM
}

export class User {
  constructor(private readonly props: UserProps) {}

  public getValue() {
    return this.props;
  }
}