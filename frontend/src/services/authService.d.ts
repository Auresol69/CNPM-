export interface User {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    [key: string]: any;
}

export interface AuthResponse {
    status: string;
    accessToken: string;
    data: {
        user: User;
    };
}

declare const authService: {
    login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    getToken: () => string | null;
    getCurrentUser: () => User | null;
    isAuthenticated: () => boolean;
    loginDemo: () => Promise<any>;
};

export default authService;
