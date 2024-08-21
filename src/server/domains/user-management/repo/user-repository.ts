import { eq } from "drizzle-orm";
import { type DbService } from "~/server/db";
import { userSchema } from "~/server/db/schema";
import { User, USER_PLAN_ENUM } from "../models/user";

export class UserRepository {
  constructor(private readonly dbService: DbService) { }

  public async save(entity: User) {
    try {
      await this.dbService.getQueryClient().insert(userSchema).values({
        id: entity.getValue().id,
        name: entity.getValue().name,
        email: entity.getValue().email,
        userPlan: entity.getValue().userPlan,
        createdAt: entity.getValue().createdAt,
      })
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
        userPlan: USER_PLAN_ENUM[rawResults.userPlan]
      })

      return user;
    } catch (error) {
      throw new Error(`Error getting user by id: ${error}`);
    }
  }

  public async getUserByIdOrFail(id: string) {
    try {
      const user = await this.getUserByIdOrNull(id)
      if (!user) throw new Error('User not found')
      return user
    } catch (error) {
      throw new Error(`Error getting user by id: ${error}`);
    }
  }
}