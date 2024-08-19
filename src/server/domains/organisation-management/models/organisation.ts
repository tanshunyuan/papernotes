import { pgOrganisationTypeEnum } from './../../../db/schema';

/**@see {@link pgOrganisationTypeEnum} */
export enum ORGANISATION_TYPE_ENUM {
  PERSONAL = 'PERSONAL',
  COMPANY = 'COMPANY'
}

interface OrganisationProps {
  id: string;
  name: string;
  description: string;
  planDurationStart: Date;
  planDurationEnd: Date;
  maxSeats: number;
  createdAt: Date;
  updatedAt: Date;
  type: ORGANISATION_TYPE_ENUM;
  deletedAt?: Date | null;
}

export class Organisation {
  constructor(private readonly props: OrganisationProps) {}

  public getValue() {
    return this.props;
  }
}