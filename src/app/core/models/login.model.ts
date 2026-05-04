import { UserDto } from './user.dto';

export interface LoginResponse {
  token: string;
  user: UserDto;
}
