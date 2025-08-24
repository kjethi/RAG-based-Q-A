// Lightweight stub of an auth service with TODOs for real implementation

import { AxiosError } from "axios";
import { apiPost } from "./api";
import type { User } from "../classes/User";

export type LoginForm = { email: string; password: string };

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export const authService = {
  async login(input: LoginForm): Promise<{ token: string; user: User }> {
    try {
      const response = await apiPost("/auth/login", {
        email: input.email,
        password: input.password,
      });
      const data = response.data as { data: { token: string; user: User } };
      return data.data;
    } catch (error) {
      let errorDetail = "Something went wrong";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data.message;
      }
      return Promise.reject(errorDetail);
    }
  },

  async signUp(input: SignUpInput): Promise<{ token: string; user: User }> {
    try {
      const response = await apiPost("/auth/register", {
        name: input.name,
        email: input.email,
        password: input.password,
      });
      const data = response.data as { data: { token: string; user: User } };
      return data.data;
    } catch (error) {
      let errorDetail = "Something went wrong";
      if (error instanceof AxiosError) {
        errorDetail = error.response?.data?.message || error.response?.data?.error || "Registration failed";
      }
      return Promise.reject(errorDetail);
    }
  },

  async logout(): Promise<void> {
    // Clear auth cookies and redirect to login
    const { removeAuthCookies } = await import("../utils/cookiesHelper");
    removeAuthCookies();
    window.location.href = "/login";
  },
};
