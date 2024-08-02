import { USER_ROLE_ENUM } from '~/server/domains/user-management/models/user';
import { Permissions, Role, ROLE_PERMISSIONS } from '../utils/permissions';
import { UserRepository } from '../../user-management/repo/user-repository';

export class AuthorisationService {
  constructor(private readonly userRepo: UserRepository){}

  public async canPerformOperation(userId: string, permission: Permissions): Promise<boolean> {
    const userResult = await this.userRepo.getUserByIdOrNull(userId);
    if (!userResult) return false;

    const user = userResult.getValue();
    // @ts-expect-error permissions aren't overlapping
    return ROLE_PERMISSIONS[user.role].includes(permission);
  }
}