import { userRepository } from "../repo";
import { UserService } from "./user-service";

export const userService = new UserService(userRepository)