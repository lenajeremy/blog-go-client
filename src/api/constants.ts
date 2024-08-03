export const baseUrl = "http://localhost:3000/api";

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string | null
  }
  