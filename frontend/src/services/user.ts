import { AxiosError } from "axios";
import type { User, UserRole } from "../classes/User";
import { apiGet, apiPut } from "./api";
import type { MetaData } from "../classes/MetaData";

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
  async fetchUsers(): Promise<{ meta: MetaData; users: User[] }> {
    try {
      const res = await apiGet<{ data: { meta: MetaData; users: User[] } }>(
        "/users"
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
    await apiPut(`/users/${id}`, { role });
  },
};
