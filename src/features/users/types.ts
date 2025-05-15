export interface UserResponseDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  active: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User extends UserResponseDto {}
