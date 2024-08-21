import { z } from "zod";
import { type Organisation } from "./organisation";

export const ResourceLimitsConfigurationSchema = z.object({
  resources: z.object({
    project: z.object({
      limit: z.number(),
      reset_duration_days: z.number(),
    }),
    feature: z.object({
      limit: z.number(),
      /**@description there isn't a reset duration for features */
      reset_duration_days: z.null(),
    }),
  }),
});

type ResourceLimitsConfiguration = z.infer<typeof ResourceLimitsConfigurationSchema>;

interface OrganisationResourceLimitsProps {
  id: string;
  orgId: Organisation['props']['id'];
  configuration: ResourceLimitsConfiguration
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrganisationResourceLimits {
  constructor(private readonly props: OrganisationResourceLimitsProps) {
    this.props.configuration = ResourceLimitsConfigurationSchema.parse(props.configuration)
  }
  public getValue() {
    return this.props;
  }
}