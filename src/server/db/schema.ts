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
    id: uuid('id').primaryKey().notNull(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    role: pgRolesEnum('role').default('MEMBER')
  }
)


