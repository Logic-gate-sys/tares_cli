import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";


const REQUEST_TIMEOUT = 10000; // 10 seconds

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    this.client = axios.create({
      baseURL,
      timeout: REQUEST_TIMEOUT, // 10 seconds request timeout
      headers: { "Content-Type": "application/json" },
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
    if (!token) return; 
    this.token = token; 
  }
  getToken(): string | null {
    return this.token;
  }

  public async post<T>(url: string, data: T, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    try {
      return await this.client.post<T>(url, data, config);
    } catch (err: unknown) {
      if (err && (err as AxiosResponse).status >= 400) {
        console.log("Status: ", (err as AxiosResponse).status);
        return (err as AxiosResponse);
      }
      console.log("Error occured: ", err)
      throw err;
    }
  }

  public async patch<T>(url: string, data: T, config?: unknown): Promise<AxiosResponse> {
    try {
      return await this.client.patch<T>(url, data, config);
    } catch (err: unknown) {
      if (err && (err as AxiosResponse).status >= 400) {
        console.log("Status: ", (err as AxiosResponse).status);
        return (err as AxiosResponse);
      }
      console.log("Error occured: ", err)
      throw err;
    }
  }

  public async put<T>(url: string, data: T, config?: unknown): Promise<AxiosResponse> {
    try {
      return await this.client.put<T>(url, data, config);
    } catch (err: unknown) {
      if (err && (err as AxiosResponse).status >= 400) {
        console.log("Status: ", (err as AxiosResponse).status);
        return (err as AxiosResponse);
      }
      console.log("Error occured: ", err)
      throw err;
    }
  }

  public async get<T>(url: string, config?: unknown): Promise<AxiosResponse> {
    try {
      return await this.client.get<T>(url, config);
    } catch (err: unknown) {
      if (err && (err as AxiosResponse).status >= 400) {
        console.log("Status: ", (err as AxiosResponse).status);
        return (err as AxiosResponse);
      }
      console.log("Error occured: ", err)
      throw err;
    }
  }

}  

// export api client for use out there 
export const apiClient = new APIClient();
