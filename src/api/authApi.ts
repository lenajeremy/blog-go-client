import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { baseUrl, ApiResponse } from "./constants";

const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => {
      return ({
          login: builder.mutation<ApiResponse<{ token: string }>, {
              password: string,
              email: string
          }>({
              query: (body) => ({
                  url: "/auth/login",
                  method: "POST",
                  body,
              }),
          }),

          register: builder.mutation<ApiResponse<unknown>, {
              password: string,
              email: string,
              firstName: string,
              lastName: string
          }>({
              query: (body) => ({
                  url: "/auth/register",
                  method: "POST",
                  body,
              }),
          }),
      });
  },
});

export const { useLoginMutation, useRegisterMutation } = authApi;

export default authApi;