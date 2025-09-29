import React, { createContext, ReactNode, useContext, useReducer } from "react";

export interface Order {
  id: string;
  item: string;
  category: string;
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
      id: "order-1",
      item: "Chicken Breast",
      category: "Proteins",
      createdAt: new Date("2024-01-15T10:30:00"),
    },
    {
      id: "order-2",
      item: "Tomatoes",
      category: "Vegetables",
      createdAt: new Date("2024-01-15T09:15:00"),
    },
    {
      id: "order-3",
      item: "Olive Oil",
      category: "Pantry",
      createdAt: new Date("2024-01-14T16:45:00"),
    },
    {
      id: "order-4",
      item: "Salmon Fillet",
      category: "Proteins",
      createdAt: new Date("2024-01-14T14:20:00"),
    },
    {
      id: "order-5",
      item: "Rice",
      category: "Grains",
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
