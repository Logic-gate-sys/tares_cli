// Auth responses
export type SignupRequest = {
    email: string;
    username: string;
    password: {
        plain_text:string;
    }
}

export type LoginRequest = {
    email: string;
    password: {
        plain_text:string;
    }
}

export type  AuthResponse = {
    token: string;
    user: {
        id: string;
        email: string;
        username: string;
        createdAt: string;
    };
}

export type ErrorResponse = {
    error: string;
    details?: unknown;
}
