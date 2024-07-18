import { type ExtractTablesWithRelations } from "drizzle-orm";
import { type PgTransaction } from "drizzle-orm/pg-core";
import {
  type PostgresJsDatabase,
  type PostgresJsQueryResultHKT,
  drizzle,
} from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "~/env";

type Schema = typeof schema;

export type DrizzleTransactionScope = PgTransaction<
  PostgresJsQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

interface DatabaseStrategy {
  getQueryClient(
    tx?: DrizzleTransactionScope,
  ): DrizzleTransactionScope | PostgresJsDatabase<Schema>;
  performMigration(): void;
}

/**@description for normal usage */
class PostgreSQLJSDatabaseStrategy implements DatabaseStrategy {
  private connectionUrl: string;
  private queryClient: PostgresJsDatabase<Schema> | null;

  constructor(connectionUrl: string) {
    this.connectionUrl = connectionUrl;
    this.queryClient = null;
  }

  public getQueryClient(tx?: DrizzleTransactionScope) {
    if (tx) {
      console.log("Using transaction scope");
      return tx;
    }

    if (this.queryClient === null) {
      const queryConnection = postgres(this.connectionUrl);
      this.queryClient = drizzle(queryConnection, { schema });
    }
    return this.queryClient;
  }

  async performMigration() {
    const migrationConnection = postgres(this.connectionUrl, { max: 1 });
    const migrationClient = drizzle(migrationConnection, { schema });

    await migrate(migrationClient, {
      migrationsFolder: "./src/server/db/migrations",
    })
      .then((res) => {
        console.log("Migration ran ==> ", res);
        return res;
      })
      .catch((err) => {
        console.log("Migration failed ==> ", err);
        return err as Error;
      })
      .finally(() => process.exit(0));
  }
}

/**@description useful when wanting to switch between different db providers under the same orm */
export class DbService {
  private strategy: DatabaseStrategy;

  constructor(strategy: DatabaseStrategy) {
    this.strategy = strategy;
  }

  public getQueryClient(tx?: DrizzleTransactionScope) {
    return this.strategy.getQueryClient(tx);
  }

  public async performMigration() {
    return this.strategy.performMigration();
  }
}

export const dbService = new DbService(
  new PostgreSQLJSDatabaseStrategy(env.DATABASE_URL),
);
