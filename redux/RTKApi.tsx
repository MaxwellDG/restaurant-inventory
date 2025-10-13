import { RootState } from './reducer';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';

export const baseQuery = (
  auth: boolean = false,
  path: string = ""
) => {
  return fetchBaseQuery({
    baseUrl: process.env.APP_URL + "/api" + path,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      headers.set('Authorization', 'Bearer ' + state.auth.access_token);
      headers.set(
        'Content-Type',
        auth ? 'multipart/form-data' : 'application/json'
      );
      headers.set('X-Mobile-App', Platform.OS);
      return headers;
    },
  });
};
