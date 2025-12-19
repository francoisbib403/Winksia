import { SetMetadata } from '@nestjs/common';
import { USER_ROLE } from 'src/user/enum';

export const Roles = (...roles: USER_ROLE[]) => SetMetadata('roles', roles);
