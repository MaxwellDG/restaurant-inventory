export const Role = {
    ADMIN: "admin",
    MEMBER: "member"
} as const

export type User = {
    id: number
    name: string
    role: keyof typeof Role
}