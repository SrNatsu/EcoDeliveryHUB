export type Role = 'ADMIN' | 'DRIVER';

export interface UserDto {
  id: number;
  name: string;
  role: Role;
}
