
export type SignupRequest = {
  email: string;
  username: string;
  password: {
    plain_text: string;
  }
}

export type LoginRequest = {
  email: string;
  password: {
    plain_text: string;
  }
}

export type AuthResponse = {
  error?: unknown;
  token: string;
  user?: {
    id: number;
    email: string;
    username?: string;
    wins: number;
    rank: string;
    accuracy: number;
    p_level?: string;
    bio?: string;
    total_score?: number;
    createdAt: string | Date;
  };
};

export type ErrorResponse = {
  error: string;
  details?: unknown;
}
