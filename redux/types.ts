import rootStore from "./store";

export type AppDispatch = typeof rootStore.dispatch;

export type PaginationFilters = Partial<{
  limit: number;
  page: number;
  startDate: number;
  endDate: number;
}>;
