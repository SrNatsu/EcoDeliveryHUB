import { Role } from './user.dto';

export interface MenuItemDto {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
}
