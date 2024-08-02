import { userRepository } from "../../user-management/repo";
import { AuthorisationService } from "./authorisation-service";

export const authorisationService = new AuthorisationService(userRepository)