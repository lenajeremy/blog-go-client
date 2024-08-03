import { configureStore } from "@reduxjs/toolkit";
import auth3Api from "./api/authApi.ts";
import authApi from "./api/blogApi.ts";

const middleware = [
    auth3Api.middleware,
    authApi.middleware
];


const store = configureStore({
    middleware(getDefaultMiddleware) {
        return getDefaultMiddleware().concat(middleware);
    },
    reducer: {
        [auth3Api.reducerPath]: auth3Api.reducer,
        [authApi.reducerPath]: authApi.reducer
    },
});

export type RootState = ReturnType<typeof store.getState>
export default store;