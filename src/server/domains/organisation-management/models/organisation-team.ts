import { type Organisation } from "./organisation";

interface OrganisationTeamProps {
  id: string;
  organisationId: Organisation['props']['id'];
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class OrganisationTeam {
  constructor(private readonly props: OrganisationTeamProps) {}

  public getValue() {
    return this.props;
  }
}
