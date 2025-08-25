import { AxiosError } from "axios";
import type { User, UserRole } from "../classes/User";
import { apiGet, apiPatch } from "./api";
import type { MetaData } from "../classes/MetaData";

interface UserFilters {
  search?: string;
  role?: UserRole;
  offset?: number;
  limit?: number;
}

export const userService = {
  async getMyUser() {
    try {
      const response = await apiGet("/auth/profile");
      const data = response.data as { data: {user : User} };
      return data.data.user;
    } catch (error) {
      let errorDetail = "Something went wrong";
      if (error instanceof AxiosError) {
        errorDetail =
          error.response?.data?.message ||
          error.response?.data?.error ||
          errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },
  
  async fetchUsers(filters?: UserFilters): Promise<{ meta: MetaData; users: User[] }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());
      if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());

      const res = await apiGet<{ data: { meta: MetaData; users: User[] } }>(
        `/users${params.toString() ? `?${params.toString()}` : ''}`
      );
      return res.data.data;
    } catch (error) {
      let errorDetail = "Failed to fetch users";
      if (error instanceof AxiosError) {
        errorDetail =
          error.response?.data?.message ||
          error.response?.data?.error ||
          errorDetail;
      }
      return Promise.reject(errorDetail);
    }
  },

  async updateUserRole(id: string, role: UserRole) {
    await apiPatch(`/users/${id}`, { role });
  },
};
