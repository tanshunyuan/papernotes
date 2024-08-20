interface ProjectProps {
  id: string;
  name: string;
  userId: string;
  /**
   * @description a project will always belong to an organisation 
   */
  organisationId: string;
  /**@description a project CAN belong to a organisation team */
  organisationTeamId: string | null;
  description: string;
  createdBy?: string
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Project {
  constructor(private readonly props: ProjectProps) { }

  public getValue(): ProjectProps {
    return this.props
  }
}