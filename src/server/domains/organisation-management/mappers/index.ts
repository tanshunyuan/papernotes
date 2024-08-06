import { organisationSchema } from "~/server/db/schema";
import { Organisation } from "../models/organisation";
import { InferSelectModel, Or } from "drizzle-orm";

type OrganisationSchemaType = InferSelectModel<typeof organisationSchema>

export class OrganisationMapper {
  public toRepo(entity: Organisation): OrganisationSchemaType {
    return {
      id: entity.getValue().id,
      name: entity.getValue().name,
      description: entity.getValue().description,
      plan_duration_start: entity.getValue().planDurationStart,
      plan_duration_end: entity.getValue().planDurationEnd,
      max_seats: entity.getValue().maxSeats,
      createdAt: entity.getValue().createdAt,
      updatedAt: entity.getValue().updatedAt,
      deletedAt: entity.getValue().deletedAt ?? null
    }
  }

  public toDomain(schema: OrganisationSchemaType): Organisation {
    return new Organisation({
      id: schema.id,
      name: schema.name,
      description: schema.description,
      planDurationStart: schema.plan_duration_start,
      planDurationEnd: schema.plan_duration_end,
      maxSeats: schema.max_seats,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt
    })
  }
}