interface ProjectProps {
  id: string;
  name: string;
  userId: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project {
  constructor(private readonly props: ProjectProps) { }

  public getValue(): ProjectProps {
    return this.props
  }
}