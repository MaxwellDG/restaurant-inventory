import { Item } from "../products/types"
import { User } from "../user/types"

export const ORDER_STATUS = {
    COMPLETED: "COMPLETED",
    PENDING_PAYMENT: "PENDING_PAYMENT",
    OPEN: "OPEN"
} as const

export type Order = {
    uuid: string
    owner: User
    items: Item[]
    status: keyof typeof ORDER_STATUS
    created_at: Date
    updated_at: Date
}


export type OrderResponse = Order[]