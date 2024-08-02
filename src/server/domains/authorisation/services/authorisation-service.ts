import { USER_ROLE_ENUM } from '~/server/domains/user-management/models/user';
import { Permissions, Role, ROLE_PERMISSIONS } from '../utils/permissions';
import { UserRepository } from '../../user-management/repo/user-repository';

export class AuthorisationService {
  // constructor(private readonly userRepo: UserRepository){}

  // private hasPermission(role: Role, permission: Permissions): boolean {
  //   return ROLE_PERMISSIONS[role].includes(permission);
  // }

  // public async canPerformOperation(userId: string,role: Role) {
  //   try {
  //     const user = await this.userRepo.getUserByIdOrFail(userId);
      
  //   } catch (error) {
  //     throw new Error('You do not have permission to perform this operation')
  //   }
  // }
}