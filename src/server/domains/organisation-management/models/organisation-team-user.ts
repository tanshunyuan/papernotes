import { type OrganisationTeam } from "./organisation-team";
import { type OrganisationUser } from "./organisation-user";

interface OrganisationTeamUserProps {
  organisationTeamId: OrganisationTeam['props']['id'];
  organisationUserId: OrganisationUser['props']['id'];
  joinedAt: Date;
  leftAt: Date | null;
}

export class OrganisationTeamUser {
  constructor(private readonly props: OrganisationTeamUserProps) {}

  public getValue() {
    return this.props;
  }
}
