import { USER_PLAN_ENUM } from '~/server/domains/user-management/models/user';
import { Permissions, Role, ROLE_PERMISSIONS } from '../utils/permissions';
import { UserRepository } from '../../user-management/repo/user-repository';

/**@todo to think how can it accomodate different plans + resource permissions */
export class AuthorisationService {
  constructor(private readonly userRepo: UserRepository){}

  public async canPerformOperation(userId: string, permission: Permissions) {
    const userResult = await this.userRepo.getUserByIdOrNull(userId);
    if (!userResult) return false;

    const user = userResult.getValue();
    return false
    // return ROLE_PERMISSIONS[user.role].includes(permission);
  }
}