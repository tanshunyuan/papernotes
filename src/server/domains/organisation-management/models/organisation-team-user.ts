import { type Organisation } from "./organisation";
import { type OrganisationUser } from "./organisation-user";

interface OrganisationTeamUserProps {
  organisationId: Organisation['props']['id'];
  organisationUserId: OrganisationUser['props']['id'];
  joinedAt: Date;
  leftAt: Date | null;
}

export class OrganisationTeam {
  constructor(private readonly props: OrganisationTeamUserProps) {}

  public getValue() {
    return this.props;
  }
}
