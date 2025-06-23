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

export interface UserUpdateDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
  roleId?: string;
}

export interface UserListResponseDto {
  items: UserResponseDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
