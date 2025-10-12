import React, { createContext, ReactNode, useContext, useReducer } from "react";

// Types
export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

type CategoryAction =
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "REMOVE_CATEGORY"; payload: string }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Initial state
const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// Reducer
const categoryReducer = (
  state: CategoryState,
  action: CategoryAction
): CategoryState => {
  switch (action.type) {
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
        error: null,
      };
    case "REMOVE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload
        ),
        error: null,
      };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
        error: null,
      };
    case "SET_CATEGORIES":
      return {
        ...state,
        categories: action.payload,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

// Context
interface CategoryContextType {
  state: CategoryState;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  updateCategory: (category: Category) => void;
  setError: (error: string | null) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

// Provider
interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(categoryReducer, initialState);

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date(),
    };
    dispatch({ type: "ADD_CATEGORY", payload: newCategory });
  };

  const removeCategory = (id: string) => {
    dispatch({ type: "REMOVE_CATEGORY", payload: id });
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: "UPDATE_CATEGORY", payload: category });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const value: CategoryContextType = {
    state,
    addCategory,
    removeCategory,
    updateCategory,
    setError,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook
export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
};
