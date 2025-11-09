import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../api";
import { API_SLICE_NAME } from "./const";

export const userApi = createApi({
  reducerPath: API_SLICE_NAME,
  baseQuery: baseQuery(),
  endpoints: (builder) => ({}),
});

export const {} = userApi;
