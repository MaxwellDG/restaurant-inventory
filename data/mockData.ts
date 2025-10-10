export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  unit: string;
  price?: number;
}

export const mockInventoryItems: InventoryItem[] = [
  // Drinks
  {
    id: "1",
    name: "Coca Cola",
    quantity: 24,
    category: "Drinks",
    unit: "cans",
  },
  {
    id: "2",
    name: "Orange Juice",
    quantity: 12,
    category: "Drinks",
    unit: "bottles",
  },
  {
    id: "3",
    name: "Coffee Beans",
    quantity: 15,
    category: "Drinks",
    unit: "lbs",
  },
  {
    id: "4",
    name: "Water Bottles",
    quantity: 50,
    category: "Drinks",
    unit: "bottles",
  },
  {
    id: "5",
    name: "Wine",
    quantity: 8,
    category: "Alcohol",
    unit: "bottles",
  },
  // Food
  {
    id: "6",
    name: "Chicken Breast",
    quantity: 25,
    category: "Food",
    unit: "lbs",
  },
  {
    id: "7",
    name: "Ground Beef",
    quantity: 30,
    category: "Food",
    unit: "lbs",
  },
  {
    id: "8",
    name: "Rice",
    quantity: 50,
    category: "Food",
    unit: "lbs",
  },
  {
    id: "9",
    name: "Pasta",
    quantity: 40,
    category: "Food",
    unit: "lbs",
  },
  {
    id: "10",
    name: "Tomatoes",
    quantity: 25,
    category: "Food",
    unit: "lbs",
  },
  {
    id: "11",
    name: "Onions",
    quantity: 20,
    category: "Food",
    unit: "lbs",
  },
  {
    id: "12",
    name: "Cheese",
    quantity: 18,
    category: "Food",
    unit: "lbs",
  },
  // Extras
  {
    id: "13",
    name: "Olive Oil",
    quantity: 8,
    category: "Extras",
    unit: "bottles",
  },
  {
    id: "14",
    name: "Salt",
    quantity: 5,
    category: "Extras",
    unit: "lbs",
  },
  {
    id: "15",
    name: "Black Pepper",
    quantity: 3,
    category: "Extras",
    unit: "lbs",
  },
  {
    id: "16",
    name: "Garlic Powder",
    quantity: 2,
    category: "Extras",
    unit: "lbs",
  },
  {
    id: "17",
    name: "Napkins",
    quantity: 100,
    category: "Extras",
    unit: "packs",
  },
  {
    id: "18",
    name: "To-Go Containers",
    quantity: 200,
    category: "Extras",
    unit: "units",
  },
  // Alcohol
  {
    id: "19",
    name: "Vodka",
    quantity: 12,
    category: "Alcohol",
    unit: "bottles",
  },
  {
    id: "20",
    name: "Whiskey",
    quantity: 8,
    category: "Alcohol",
    unit: "bottles",
  },
  {
    id: "21",
    name: "Beer",
    quantity: 48,
    category: "Alcohol",
    unit: "bottles",
  },
  {
    id: "22",
    name: "Rum",
    quantity: 6,
    category: "Alcohol",
    unit: "bottles",
  },
  {
    id: "23",
    name: "Tequila",
    quantity: 4,
    category: "Alcohol",
    unit: "bottles",
  },
  {
    id: "24",
    name: "Gin",
    quantity: 3,
    category: "Alcohol",
    unit: "bottles",
  },
  // Cleaning
  {
    id: "25",
    name: "Dish Soap",
    quantity: 15,
    category: "Cleaning",
    unit: "bottles",
  },
  {
    id: "26",
    name: "All-Purpose Cleaner",
    quantity: 8,
    category: "Cleaning",
    unit: "bottles",
  },
  {
    id: "27",
    name: "Sanitizer",
    quantity: 12,
    category: "Cleaning",
    unit: "bottles",
  },
  {
    id: "28",
    name: "Paper Towels",
    quantity: 24,
    category: "Cleaning",
    unit: "rolls",
  },
  {
    id: "29",
    name: "Floor Cleaner",
    quantity: 6,
    category: "Cleaning",
    unit: "bottles",
  },
  {
    id: "30",
    name: "Glass Cleaner",
    quantity: 4,
    category: "Cleaning",
    unit: "bottles",
  },
];
