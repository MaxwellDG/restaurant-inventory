import { createApi } from "@reduxjs/toolkit/query/react";
import { Item } from "../products/types";
import { baseQuery } from "../RTKApi";
import { PaginationFilters } from "../types";
import { API_SLICE_NAME, URL_ORDERS } from "./const";
import { Order } from "./types";

export const ordersApi = createApi({
  reducerPath: API_SLICE_NAME,
  baseQuery: baseQuery(),
  tagTypes: ["orders"],
  endpoints: (builder) => ({
    getOrder: builder.query<Order, string>({
      query(uuid) {
        return {
          url: URL_ORDERS + `/${uuid}`,
        };
      },
    }),
    getOrders: builder.query<Order[], PaginationFilters>({
      query(body) {
        return {
          url: URL_ORDERS,
          body,
        };
      },
    }),
    createOrder: builder.mutation<Order, Item[]>({
      query(body) {
        return {
          method: "POST",
          url: URL_ORDERS,
          body,
        };
      },
      invalidatesTags: ["orders"],
    }),
    updateOrder: builder.mutation<Order, { order_uuid: string; items: Item[] }>(
      {
        query(body) {
          return {
            method: "POST",
            url: URL_ORDERS,
            body,
          };
        },
        invalidatesTags: ["orders"],
      }
    ),
    deleteOrder: builder.mutation<Order, string>({
      query(uuid) {
        return {
          method: "DELETE",
          url: URL_ORDERS + `/${uuid}`,
        };
      },
      invalidatesTags: ["orders"],
    }),
  }),
});

export const {
  useGetOrderQuery,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
