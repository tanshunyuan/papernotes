import { clerkClient } from "@clerk/nextjs/server";
import { User, USER_PLAN_ENUM } from "../models/user";
import { UserRepository } from "../repo/user-repository";

export class UserService {
  constructor(
    private readonly userRepo: UserRepository
  ) { }

  public async registerExistingClerkUser(userId: string) {
    try {
      const existingUser = await this.userRepo.getUserByIdOrNull(userId)
      if (existingUser) return null

      const clerkUser = await clerkClient.users.getUser(userId)

      const user = new User({
        id: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        /**@todo learn how to hide this in the class */
        plan: USER_PLAN_ENUM.FREE
      })

      await this.userRepo.save(user)
    } catch (error) {
      throw new Error(`Error registering user: ${error}`)
    }
  }
}