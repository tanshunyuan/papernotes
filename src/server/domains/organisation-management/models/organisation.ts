interface OrganisationProps {
  id: string;
  name: string;
  description: string;
  planDurationStart: Date;
  planDurationEnd: Date;
  maxSeats: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class Organisation {
  constructor(private readonly props: OrganisationProps) {}

  public getValue() {
    return this.props;
  }
}