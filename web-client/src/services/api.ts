import axios, { type AxiosInstance } from "axios";
import type { AuthResponse, SignupRequest, LoginRequest } from "#types/type";
const REQUEST_TIMEOUT = 10000// 10 seconds
class APIClient {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor() {
        const baseURL = import.meta.env.VITE_BASE_URL;
        this.client = axios.create({
            baseURL,
            timeout: REQUEST_TIMEOUT, // 10 seconds request timeout
            headers: {
                "Content-Type": "application/json",
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
        return this.token; 
    }

    async signup(data: SignupRequest): Promise<AuthResponse> {
        try {
            const res = await this.client.post<AuthResponse>("/users/signup", data);
            return res.data as AuthResponse;
        } catch (err:unknown) {
            throw new Error(err.response?.data?.error?? "Signup failed");
        }
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const res = await this.client.post<AuthResponse>("/users/login",data);
            return res.data;
        } catch (err: unknown) {
            throw new Error(err.response?.data?.error?? "Login failed");
        }
    }

    // other api services
}

export const apiClient = new APIClient();
