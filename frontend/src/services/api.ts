import axios, {
  type AxiosResponse,
  type AxiosRequestConfig,
  isCancel,
} from "axios";
import Cookies from "universal-cookie";
import { getCookie, removeAuthCookies } from "../utils/cookiesHelper";

const API = axios.create({
  baseURL: "http://localhost:3001",
});

API.interceptors.request.use((config) => {
  // Append "Authorization" to request headers if found in the cookies.
  const access_token = getCookie("access_token");
  console.log("access_token",access_token);
  
  // Set Header call
  if (config.headers?.common) {
    config.headers.common["Authorization"] = "Bearer " + access_token;
    API.defaults.headers.common["Authorization"] = "Bearer " + access_token;
  }

  return config;
});

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    //* if cancel, return error
    if (isCancel(error) || error?.message.match(/timeout/)) {
      return Promise.reject(error);
    }
    const originalRequest = error.config;
    const cookies = new Cookies();
    const access_token = cookies.get("access_token");

    //* if the call hasn't been retried, retry once first
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (access_token) {
        API.defaults.headers.common["Authorization"] = "Bearer " + access_token;
        originalRequest.headers["Authorization"] = "Bearer " + access_token;
        return API(originalRequest);
      } else {
        //* remove token function
        setAuthorizationHeader(null);
        removeAuthCookies();
        window.location.reload();
      }
    } else if (error.response.status === 401 && originalRequest._retry) {
      //* Call HAS been retried and there is still a 401 error
      setAuthorizationHeader(null);
      removeAuthCookies();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

//* ---- Use theses instead of importing API ---- *//
export function apiGet<T = unknown, R = AxiosResponse<T>, D = unknown>(
  url: string,
  config?: AxiosRequestConfig<D>
) {
  return API.get<T, R, D>(url, config);
}
export function apiPost<T = unknown, R = AxiosResponse<T>, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>
) {
  return API.post<T, R, D>(url, data, config);
}
export function apiPut<T = unknown, R = AxiosResponse<T>, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>
) {
  return API.put<T, R, D>(url, data, config);
}
export function apiPatch<T = unknown, R = AxiosResponse<T>, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>
) {
  return API.patch<T, R, D>(url, data, config);
}
export function apiDelete<T = unknown, R = AxiosResponse<T>, D = unknown>(
  url: string,
  config?: AxiosRequestConfig<D>
) {
  return API.delete<T, R, D>(url, config);
}
export function setAuthorizationHeader(value: unknown) {
  API.defaults.headers.common["Authorization"] = value as string | undefined;
}
export function getAuthorizationHeader() {
  return API.defaults.headers.common["Authorization"];
}
