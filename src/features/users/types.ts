export interface UserMeResponse {
    id: string
    username: string
    email: string
    roleId: string
}

export interface User {
    id: string
    username: string
    firstName: string
    lastName: string
    email: string
    roleId: string
    active: boolean
}
