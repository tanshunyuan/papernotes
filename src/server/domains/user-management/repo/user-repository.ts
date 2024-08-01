import { eq } from "drizzle-orm";
import { DbService } from "~/server/db";
import { userSchema } from "~/server/db/schema";
import { User, USER_ROLE_ENUM } from "../models/user";

export class UserRepository {
  constructor(private readonly dbService: DbService) { }

  public async save(entity: User) {
    try {
      await this.dbService.getQueryClient().insert(userSchema).values(entity.getValue())
    } catch (error) {
      throw new Error(`Error saving user: ${error}`);
    }
  }

  public async getUserByIdOrNull(id: string) {
    try {
      const rawResults = await this.dbService.getQueryClient().query.userSchema
        .findFirst({
          where: eq(userSchema.id, id)
        })

      if (!rawResults) return null;

      const user = new User({
        id: rawResults.id,
        email: rawResults.email,
        name: rawResults.name,
        createdAt: rawResults.createdAt,
        role: USER_ROLE_ENUM[rawResults.role]
      })

      return user;
    } catch (error) {
      throw new Error(`Error getting user by id: ${error}`);
    }

  }
}