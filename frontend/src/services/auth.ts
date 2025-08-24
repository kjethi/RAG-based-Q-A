// Lightweight stub of an auth service with TODOs for real implementation

import { AxiosError } from "axios";
import { apiPost } from "./api";
import type { User } from "../classes/user";

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

  async signUp(_input: SignUpInput): Promise<void> {
    // TODO: Call backend API to sign up a new user
    return;
  },
  

  async logout(): Promise<void> {
    // TODO: Clear session/token and notify backend if needed
    return;
  },
};
