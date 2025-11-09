import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../api";
import { API_SLICE_NAME, URL_EXPORT } from "./const";
import { ExportDataPayload } from "./types";

export const exportApi = createApi({
  reducerPath: API_SLICE_NAME,
  baseQuery: baseQuery(),
  endpoints: (builder) => ({
    exportData: builder.mutation<void, ExportDataPayload>({
      query(body) {
        return {
          url: URL_EXPORT,
          body,
          method: "POST",
        };
      },
    }),
  }),
});

export const { useExportDataMutation } = exportApi;
