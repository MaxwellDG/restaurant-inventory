import { AuthUser } from "../auth/types"

export interface Company {
    id: number
    name: string
}

export interface UserCompany extends Company {
    members: AuthUser[]
}

export interface JoinCompanyResponse {
    company: Company
}