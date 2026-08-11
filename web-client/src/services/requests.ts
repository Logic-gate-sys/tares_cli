import axios, { type AxiosInstance } from "axios";
import type { AxiosResponse } from "node_modules/axios/index.d.cts";


const REQUEST_TIMEOUT = 10000; // 10 seconds

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    this.client = axios.create({
      baseURL,
      timeout: REQUEST_TIMEOUT, // 10 seconds request timeout
      headers: {
        "Content-Type":"application/json",
      },
    });
    // Auto-inject token on every request
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string | null) {
    this.token = token;
  }
  getToken(): string {
    if (this.token) {
      return this.token;
    }
  }

  public async post<T>(url: string, data: T, config?: unknown): Promise<AxiosResponse> {
    try {
      const res = await this.client.post<T>(url, data, config);
      return res;
    } catch (err: unknown) {
      console.log("Error occured: ", err)
      throw new Error("Request failed with error: ", err);
    }
  }

  public async patch<T>(url: string, data: T, config?: unknown): Promise<AxiosResponse> {
    try {
      const res = await this.client.patch<T>(url, data, config);
      return res;
    } catch (err: unknown) {
      console.log("Error occured: ", err)
      throw new Error("Request failed with error: ", err)
    }
  }

  public async put<T>(url: string, data: T, config?: unknown): Promise<AxiosResponse> {
    try {
      const res = await this.client.put<T>(url, data, config);
      return res;
    } catch (err: unknown) {
      console.log("Error occured: ", err)
      throw new Error("Request failed with error: ", err)
    }
  }

  public async get<T>(url: string, config?: unknown): Promise<AxiosResponse> {
    try {
      const res = await this.client.get<T>(url, config);
      return res;
    } catch (err: unknown) {
      console.log("Error occured: ", err)
      throw new Error("Request failed with error: ", err)
    }
  }
}

export const apiClient = new APIClient();
