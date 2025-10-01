import React, { createContext, ReactNode, useContext, useReducer } from "react";

export interface Order {
  id: string;
  item: string;
  category: string;
  user: string;
  createdAt: Date;
}

interface OrdersState {
  orders: Order[];
}

type OrdersAction =
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "DELETE_ORDER"; payload: string }
  | { type: "CLEAR_ALL_ORDERS" }
  | { type: "SET_ORDERS"; payload: Order[] };

const initialState: OrdersState = {
  orders: [
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      item: "Chicken Breast",
      category: "Proteins",
      user: "John Smith",
      createdAt: new Date("2024-01-15T10:30:00"),
    },
    {
      id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
      item: "Tomatoes",
      category: "Vegetables",
      user: "Sarah Johnson",
      createdAt: new Date("2024-01-15T09:15:00"),
    },
    {
      id: "c3d4e5f6-g7h8-9012-cdef-345678901234",
      item: "Olive Oil",
      category: "Pantry",
      user: "Mike Wilson",
      createdAt: new Date("2024-01-14T16:45:00"),
    },
    {
      id: "d4e5f6g7-h8i9-0123-def0-456789012345",
      item: "Salmon Fillet",
      category: "Proteins",
      user: "Emily Davis",
      createdAt: new Date("2024-01-14T14:20:00"),
    },
    {
      id: "e5f6g7h8-i9j0-1234-ef01-567890123456",
      item: "Rice",
      category: "Grains",
      user: "John Smith",
      createdAt: new Date("2024-01-13T11:00:00"),
    },
  ],
};

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "ADD_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
      };
    case "DELETE_ORDER":
      return {
        ...state,
        orders: state.orders.filter((order) => order.id !== action.payload),
      };
    case "CLEAR_ALL_ORDERS":
      return {
        ...state,
        orders: [],
      };
    case "SET_ORDERS":
      return {
        ...state,
        orders: action.payload,
      };
    default:
      return state;
  }
}

interface OrdersContextType {
  state: OrdersState;
  addOrder: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;
  setOrders: (orders: Order[]) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

interface OrdersProviderProps {
  children: ReactNode;
}

export function OrdersProvider({ children }: OrdersProviderProps) {
  const [state, dispatch] = useReducer(ordersReducer, initialState);

  const addOrder = (order: Order) => {
    dispatch({ type: "ADD_ORDER", payload: order });
  };

  const deleteOrder = (orderId: string) => {
    dispatch({ type: "DELETE_ORDER", payload: orderId });
  };

  const clearAllOrders = () => {
    dispatch({ type: "CLEAR_ALL_ORDERS" });
  };

  const setOrders = (orders: Order[]) => {
    dispatch({ type: "SET_ORDERS", payload: orders });
  };

  const value: OrdersContextType = {
    state,
    addOrder,
    deleteOrder,
    clearAllOrders,
    setOrders,
  };

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
