import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { RootState } from "./store";

export const baseQuery = (auth: boolean = false, path: string = "") => {

  let apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
  if (process.env.EXPO_PUBLIC_APP_ENV === "local") {
    // different emulator OS accesses localhost in different ways
    if (Platform.OS === "ios") {
      apiUrl = "http://127.0.0.1:8000";
    } else if (Platform.OS === "android") {
      apiUrl = "http://10.0.2.2:8000";
    } else {
      apiUrl = "http://localhost:8000";
    }
  }

  return fetchBaseQuery({
    baseUrl: apiUrl + "/api" + path,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      if (state.auth.access_token) {
        headers.set("Authorization", "Bearer " + state.auth.access_token);
      }
      headers.set(
        "Content-Type",
        auth ? "multipart/form-data" : "application/json"
      );
      headers.set("X-Mobile-App", Platform.OS);
      return headers;
    },
  });
};
