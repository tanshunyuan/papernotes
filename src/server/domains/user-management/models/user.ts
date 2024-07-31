import { type pgRolesEnum } from '~/server/db/schema';

interface UserProps {
  id: string
  email: string
  name: string
  createdAt?: Date
  role: typeof pgRolesEnum
}

export class User {
  constructor(private readonly props: UserProps) {}

  public getValue() {
    return this.props;
  }
}