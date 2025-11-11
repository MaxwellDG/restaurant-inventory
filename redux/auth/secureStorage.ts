import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Saves the refresh token to secure storage
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error("Failed to save refresh token:", error);
    throw error;
  }
};

/**
 * Retrieves the refresh token from secure storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get refresh token:", error);
    return null;
  }
};

/**
 * Removes the refresh token from secure storage
 */
export const removeRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to remove refresh token:", error);
    // Don't throw - best effort cleanup
  }
};
