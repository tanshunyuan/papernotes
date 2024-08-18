import { type OrganisationTeam } from "./organisation-team";
import { type Membership } from "./membership";

interface OrganisationTeamMemberProps {
  organisationTeamId: OrganisationTeam['props']['id'];
  membershipId: Membership['props']['id'];
  joinedAt: Date;
  leftAt: Date | null;
}

export class OrganisationTeamMember {
  constructor(private readonly props: OrganisationTeamMemberProps) {}

  public getValue() {
    return this.props;
  }
}
