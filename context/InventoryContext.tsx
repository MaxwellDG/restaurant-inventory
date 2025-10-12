import { InventoryItem } from "@/data/mockData";
import React, { createContext, ReactNode, useContext, useReducer } from "react";

interface InventoryState {
  items: InventoryItem[];
}

type InventoryAction =
  | { type: "ADD_ITEM"; payload: InventoryItem }
  | { type: "UPDATE_ITEM"; payload: InventoryItem }
  | { type: "DELETE_ITEM"; payload: string }
  | { type: "SET_ITEMS"; payload: InventoryItem[] }
  | {
      type: "ADJUST_QUANTITY";
      payload: { itemId: string; quantityChange: number };
    };

const initialState: InventoryState = {
  items: [],
};

function inventoryReducer(
  state: InventoryState,
  action: InventoryAction
): InventoryState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case "DELETE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.name !== action.payload),
      };
    case "SET_ITEMS":
      return {
        ...state,
        items: action.payload,
      };
    case "ADJUST_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                quantity: item.quantity + action.payload.quantityChange,
              }
            : item
        ),
      };
    default:
      return state;
  }
}

interface InventoryContextType {
  state: InventoryState;
  addItem: (item: InventoryItem) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (itemName: string) => void;
  setItems: (items: InventoryItem[]) => void;
  adjustQuantity: (itemId: string, quantityChange: number) => void;
  getItemsByCategory: (category: string) => InventoryItem[];
  findItem: (name: string, category: string) => InventoryItem | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  const addItem = (item: InventoryItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const updateItem = (item: InventoryItem) => {
    dispatch({ type: "UPDATE_ITEM", payload: item });
  };

  const deleteItem = (itemName: string) => {
    dispatch({ type: "DELETE_ITEM", payload: itemName });
  };

  const setItems = (items: InventoryItem[]) => {
    dispatch({ type: "SET_ITEMS", payload: items });
  };

  const adjustQuantity = (itemId: string, quantityChange: number) => {
    dispatch({ type: "ADJUST_QUANTITY", payload: { itemId, quantityChange } });
  };

  const getItemsByCategory = (category: string) => {
    return state.items.filter((item) => item.category === category);
  };

  const findItem = (name: string, category: string) => {
    return state.items.find(
      (item) => item.name === name && item.category === category
    );
  };

  const value: InventoryContextType = {
    state,
    addItem,
    updateItem,
    deleteItem,
    setItems,
    adjustQuantity,
    getItemsByCategory,
    findItem,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
