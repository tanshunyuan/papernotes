import { dbService } from "~/server/db";

await dbService.performMigration();
