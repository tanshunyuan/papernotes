import { pgRolesEnum, pgUserPlanEnum } from '~/server/db/schema';


/**@see {@link pgUserPlanEnum} */
export enum USER_PLAN_ENUM {
  FREE = 'FREE',
  ENTERPRISE = 'ENTERPRISE'
}

interface UserProps {
  id: string
  email: string
  name: string
  createdAt?: Date
  plan: USER_PLAN_ENUM
}

export class User {
  constructor(private readonly props: UserProps) { }

  public getValue() {
    return this.props;
  }

  public isEmployee() {
    return this.props.email.includes('@gignite')
  }
}