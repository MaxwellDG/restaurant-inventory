import { Role, User } from "../user/types"

export interface Company {
    id: number
    name: string
}

export interface UserCompany extends Company {
    members: User[]
}
