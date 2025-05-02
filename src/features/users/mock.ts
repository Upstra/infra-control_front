import type { User } from "./types";

export const getMockUsers = (): User[] => [
    { id: '1', username: 'admin', email: 'admin@lab.local', roleId: 'admin-role-id', firstName: 'Marie', lastName: 'Curie', active: true },
    { id: '2', username: 'techlab', email: 'tech@lab.local', roleId: 'tech-role-id', firstName: 'Jeanne', lastName: 'Dupont', active: true },
    { id: '3', username: 'invite', email: 'guest@lab.local', roleId: 'guest-role-id', firstName: 'Jean', lastName: 'Dupont', active: false },
    { id: '4', username: 'ronan', email: 'ronan@lab.local', roleId: 'guest-role-id', firstName: 'Ronan', lastName: 'Le Goff', active: true },
    { id: '5', username: 'james', email: 'james@lab.local', roleId: 'guest-role-id', firstName: 'James', lastName: 'Bond', active: false },
    { id: '6', username: 'charles', email: 'charles@lab.local', roleId: 'guest-role-id', firstName: 'Charles', lastName: 'Darwin', active: false },
]