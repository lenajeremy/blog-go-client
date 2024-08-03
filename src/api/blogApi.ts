import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseUrl} from "./constants";

export interface BlogPost {
    id: string,
    createdAt: string,
    updatedAt: string,
    authorId: string,
    title: string,
    subtitle: string,
    content: string,
    comments: Comment[]
}

export interface Comment {

}

const blogApi = createApi({
    reducerPath: 'blogApi',
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl + "/post", prepareHeaders: (headers) => {
            const token = localStorage.getItem("TOKEN");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`)
            }
            return headers
        }
    }),
    endpoints(build) {
        return {
            fetchAllPosts: build.query<ApiResponse<BlogPost[]>, void>({
                query: () => "/all",
                providesTags: ["BlogPost"]
            }),
            fetchPersonalPosts: build.query<ApiResponse<BlogPost[]>, void>({
                query: () => "/"
            }),
            createBlogPost: build.mutation<ApiResponse<BlogPost>, {
                title: string,
                content: string,
                subtitle: string
            }>({
                query: (args) => ({
                    url: '/',
                    method: "POST",
                    body: args
                }),
                invalidatesTags: ["BlogPost"]
            }),

        }
    },
    tagTypes: ["BlogPost"]
})


export const {
    useFetchAllPostsQuery,
    useFetchPersonalPostsQuery,
    useCreateBlogPostMutation,
} = blogApi

export default blogApi