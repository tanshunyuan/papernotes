import { User } from "../../user-management/models/user";
import { Organisation } from "./organisation";

interface OrganisationUserProps {
  id: string;
  organisationId: Organisation['props']['id'];
  userId: User['props']['id'];
  createdAt: Date;
  updatedAt: Date;
}

export class OrganisationUser {
  constructor(private readonly props: OrganisationUserProps) {}

  public getValue() {
    return this.props;
  }
}