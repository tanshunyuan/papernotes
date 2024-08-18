interface ProjectProps {
  id: string;
  name: string;
  /**
   * @deprecated tie a project to an organisation instead 
   * @todo drop userId references only when all projects have an organisationId
   */
  userId: string;
  /**
   * @description a project will always belong to an organisation 
   * @todo existing project will not have an organisationId, it needs to be migrated
   * @todo remove null once all projects have an organisationId
   */
  organisationId: string | null;
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