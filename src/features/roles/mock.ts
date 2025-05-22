import type { Role } from "./types";

export const getMockRoles = (): Role[] => [
    { id: 'admin-role-id', name: 'Admin' },
    { id: 'tech-role-id', name: 'Technicien' },
    { id: 'guest-role-id', name: 'Invité' },
]