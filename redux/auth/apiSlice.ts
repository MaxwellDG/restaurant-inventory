import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../api";
import { API_SLICE_NAME, AUTH_ENDPOINTS, URL_AUTH } from "./const";
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "./types";

export const authApi = createApi({
  reducerPath: API_SLICE_NAME,
  baseQuery: baseQuery(false, URL_AUTH),
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query(body) {
        return {
          method: "POST",
          url: AUTH_ENDPOINTS.REGISTER,
          body,
        };
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query(body) {
        return {
          method: "POST",
          url: AUTH_ENDPOINTS.LOGIN,
          body,
        };
      },
    }),
    logout: builder.mutation<void, void>({
      query() {
        return {
          method: "POST",
          url: AUTH_ENDPOINTS.LOGOUT,
        };
      },
      invalidatesTags: ["auth"],
    }),
    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordRequest
    >({
      query(body) {
        return {
          method: "POST",
          url: AUTH_ENDPOINTS.FORGOT_PASSWORD,
          body,
        };
      },
    }),
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query(body) {
        return {
          method: "POST",
          url: AUTH_ENDPOINTS.RESET_PASSWORD,
          body,
        };
      },
    }),
    verifyEmail: builder.mutation<{ message: string }, VerifyEmailRequest>({
      query({ id, hash }) {
        return {
          method: "GET",
          url: `${AUTH_ENDPOINTS.VERIFY_EMAIL}/${id}/${hash}`,
        };
      },
    }),
    sendEmailVerification: builder.mutation<{ message: string }, void>({
      query() {
        return {
          method: "POST",
          url: AUTH_ENDPOINTS.EMAIL_VERIFICATION_NOTIFICATION,
        };
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useSendEmailVerificationMutation,
} = authApi;
