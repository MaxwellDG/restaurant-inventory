export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  unit: string;
  price?: number;
}

export const mockInventoryItems: InventoryItem[] = [];
