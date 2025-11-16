import { createApi } from "@reduxjs/toolkit/query/react";
import { Company, UserCompany } from "./types";
import { baseQuery } from "../api";

export const companiesApi = createApi({
  reducerPath: "companies",
  baseQuery: baseQuery(),
  endpoints: (builder) => ({
    getCompany: builder.query<{ data: UserCompany | Company }, number>({
      query: (id) => `/companies/${id}`,
    }),
  }),
});

export const { useGetCompanyQuery } = companiesApi;