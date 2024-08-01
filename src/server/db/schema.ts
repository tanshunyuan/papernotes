// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
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
})

export const projectSchemaRelations = relations(projectSchema, ({ one }) => ({
  users: one(userSchema, {
    fields: [projectSchema.userId],
    references: [userSchema.id]
  })
}))
