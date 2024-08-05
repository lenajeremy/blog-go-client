export const baseUrl = "https://go-blog-server-production.up.railway.app/api";

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string | null
  }
  