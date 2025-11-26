export const API_SLICE_NAME = "authApi";

export const URL_AUTH = "/auth";

export const AUTH_ENDPOINTS = {
  REGISTER: "/register",
  LOGIN: "/login",
  LOGOUT: "/logout",
  USER: "/user",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  EMAIL_VERIFICATION_NOTIFICATION: "/email/verification-notification",
} as const;
