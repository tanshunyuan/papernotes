// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTableCreator,
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

export const userSchema = createTable(
  'users',
  {
    id: text('id').primaryKey().notNull(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    role: pgRolesEnum('role').default('MEMBER').notNull(),
  }
)

export const userSchemaRelations = relations(userSchema, ({ many }) => ({
  projects: many(projectSchema)
}))

export const projectSchema = createTable('projects', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
  description: text('description').notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  deletedAt: timestamp('deleted_at')
})

export const projectSchemaRelations = relations(projectSchema, ({ one }) => ({
  users: one(userSchema, {
    fields: [projectSchema.userId],
    references: [userSchema.id]
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
})

export const organisationSchemaRelations = relations(organisationSchema, ({ many }) => ({
  users: many(organisationUsersSchema)
}))

export const organisationUsersSchema = createTable('organisation_users', {
  id: text('id').primaryKey().notNull(),
  organisationId: text('organisation_id').references(() => organisationSchema.id).notNull(),
  userId: text('user_id').references(() => userSchema.id).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const organisationUsersSchemaRelations = relations(organisationUsersSchema, ({ one }) => ({
  organisation: one(organisationSchema, {
    fields: [organisationUsersSchema.organisationId],
    references: [organisationSchema.id]
  }),
  user: one(userSchema, {
    fields: [organisationUsersSchema.userId],
    references: [userSchema.id]
  })
}))
