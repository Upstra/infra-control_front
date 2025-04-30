import type { User } from "./types";

export const getMockUsers = (): User[] => [
    { id: '1', username: 'admin', email: 'admin@lab.local', roleId: 'admin-role-id', firstName: 'Marie', lastName: 'Curie' },
    { id: '2', username: 'techlab', email: 'tech@lab.local', roleId: 'tech-role-id', firstName: 'Jeanne', lastName: 'Dupont' },
    { id: '3', username: 'invite', email: 'guest@lab.local', roleId: 'guest-role-id', firstName: 'Jean', lastName: 'Dupont' },
    { id: '4', username: 'ronan', email: 'ronan@lab.local', roleId: 'guest-role-id', firstName: 'Ronan', lastName: 'Le Goff' },
    { id: '5', username: 'james', email: 'james@lab.local', roleId: 'guest-role-id', firstName: 'James', lastName: 'Bond' },
    { id: '6', username: 'charles', email: 'charles@lab.local', roleId: 'guest-role-id', firstName: 'Charles', lastName: 'Darwin' },
]