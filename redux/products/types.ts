export interface 

export type Item = {
    id: number
    name: string
    quantity: number
    typeOfUnit: string
    price?: number
    category_id: number
}

export type Category = {
    id: number
    name: string
    items: Item[]
}

export type InventoryResponse = Category[]