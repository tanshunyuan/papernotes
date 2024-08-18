// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `papernotes_${name}`);

export const pgRolesEnum = pgEnum('roles_enum', ['ADMIN', 'MEMBER'])
export const pgUserPlanEnum = pgEnum('user_plan_enum', ['FREE', 'ENTERPRISE'])

export const userSchema = createTable(
  'users',
  {
    id: text('id').primaryKey().notNull(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    userPlan: pgUserPlanEnum('user_plan').default('FREE').notNull(),
  }
)

export const userSchemaRelations = relations(userSchema, ({ many }) => ({
  /**@deprecated to be removed once all projects have an organisationId */
  projects: many(projectSchema)
}))

export const projectSchema = createTable('projects', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  /**@deprecated to be removed once all projects have an organisationId */
  userId: text('user_id').references(() => userSchema.id).notNull(),
  /**@todo make it not null once all projects have an organisationId */
  organisationId: text('organisation_id').references(() => organisationSchema.id),
  organisationTeamId: text('organisation_team_id').references(() => organisationTeamsSchema.id),
  description: text('description').notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  deletedAt: timestamp('deleted_at')
})

export const projectSchemaRelations = relations(projectSchema, ({ one }) => ({
  /**@deprecated to be removed once all projects have an organisationId */
  users: one(userSchema, {
    fields: [projectSchema.userId],
    references: [userSchema.id]
  }),
  organisation_id: one(organisationSchema, {
    fields: [projectSchema.organisationId],
    references: [organisationSchema.id]
  }),
  organisation_team: one(organisationTeamsSchema, {
    fields: [projectSchema.organisationTeamId],
    references: [organisationTeamsSchema.id]
  })
}))

export const organisationSchema = createTable('organisations', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  plan_duration_start: timestamp('plan_duration_start').notNull(),
  plan_duration_end: timestamp('plan_duration_end').notNull(),
  max_seats: integer('max_seats').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  deletedAt: timestamp('deleted_at')
})

export const organisationSchemaRelations = relations(organisationSchema, ({ many, one }) => ({
  organisation_users: many(organisationUsersSchema),
  resource_limits: one(organisationResourceLimitsSchema),
  organisation_teams: many(organisationTeamsSchema),
  projects: many(projectSchema)
}))

export const organisationResourceLimitsSchema = createTable('organisation_resource_limits', {
  id: text('id').primaryKey().notNull(),
  orgId: text('org_id').references(() => organisationSchema.id).notNull().unique(),
  configuration: json('configuration').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const organisationResourceLimitsSchemaRelations = relations(organisationResourceLimitsSchema, ({ one }) => ({
  organisation: one(organisationSchema, {
    fields: [organisationResourceLimitsSchema.orgId],
    references: [organisationSchema.id]
  })
}))

export const organisationUsersSchema = createTable('organisation_users', {
  id: text('id').primaryKey().notNull(),
  organisationId: text('organisation_id').references(() => organisationSchema.id).notNull(),
  userId: text('user_id').references(() => userSchema.id).notNull(),
  role: pgRolesEnum('role').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const organisationUsersSchemaRelations = relations(organisationUsersSchema, ({ one, many }) => ({
  organisation: one(organisationSchema, {
    fields: [organisationUsersSchema.organisationId],
    references: [organisationSchema.id]
  }),
  user: one(userSchema, {
    fields: [organisationUsersSchema.userId],
    references: [userSchema.id]
  }),
  organisation_team_users: many(organisationTeamUsersSchema)
}))

export const organisationTeamsSchema = createTable('organisation_teams', {
  id: text('id').primaryKey().notNull(),
  organisationId: text('organisation_id').references(() => organisationSchema.id).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  deletedAt: timestamp('deleted_at')
})

export const organisationTeamsSchemaRelations = relations(organisationTeamsSchema, ({ one, many }) => ({
  organisation: one(organisationSchema, {
    fields: [organisationTeamsSchema.organisationId],
    references: [organisationSchema.id]
  }),
  organisation_team_users: many(organisationTeamUsersSchema),
  projects: many(projectSchema)
}))

export const organisationTeamUsersSchema = createTable('organisation_team_users', {
  organisationTeamId: text('organisation_team_id').references(() => organisationTeamsSchema.id).notNull(),
  organisationUserId: text('organisation_user_id').references(() => organisationUsersSchema.id).notNull(),
  joinedAt: timestamp('joined_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  leftAt: timestamp('left_at')
}, (t) => ({
  pk: primaryKey({
    columns: [t.organisationTeamId, t.organisationUserId]
  })
}))

export const organisationTeamUsersRelations = relations(organisationTeamUsersSchema, ({ one }) => ({
  organisation_team: one(organisationTeamsSchema, {
    fields: [organisationTeamUsersSchema.organisationTeamId],
    references: [organisationTeamsSchema.id],
  }),
  organisation_user: one(organisationUsersSchema, {
    fields: [organisationTeamUsersSchema.organisationUserId],
    references: [organisationUsersSchema.id],
  })
}))
