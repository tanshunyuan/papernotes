import { type projectSchema } from "~/server/db/schema";
import { Project } from "../models/project";
import { type InferSelectModel } from "drizzle-orm";

type ProjectSchemaType = InferSelectModel<typeof projectSchema>

export class ProjectMapper {
  public toRepo(entity: Project): ProjectSchemaType {
    return {
      id: entity.getValue().id,
      name: entity.getValue().name,
      userId: entity.getValue().userId,
      description: entity.getValue().description,
      organisationId: entity.getValue().organisationId,
      organisationTeamId: entity.getValue().organisationTeamId,
      updatedAt: entity.getValue().updatedAt,
      createdAt: entity.getValue().createdAt,
      deletedAt: entity.getValue().deletedAt ?? null
    }
  }

  public toDomain(schema: ProjectSchemaType & { createdBy?: string }): Project {
    return new Project({
      id: schema.id,
      name: schema.name,
      userId: schema.userId,
      createdBy: schema.createdBy,
      description: schema.description,
      organisationId: schema.organisationId,
      organisationTeamId: schema.organisationTeamId,
      updatedAt: schema.updatedAt,
      createdAt: schema.createdAt,
      deletedAt: schema.deletedAt
    })
  }
}
