import { AxiosError } from "axios";
import type { User } from "../classes/user";
import { apiGet } from "./api";

export const userService = {
  async getMyUser() {
    try {
      const response = await apiGet("/auth/profile");
      const data = response.data as { data: User };
      return data.data;
    } catch (error) {
      let errorDetail = "Something went wrong";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data.message;
      }
      return Promise.reject(errorDetail);
    }
  },
};
