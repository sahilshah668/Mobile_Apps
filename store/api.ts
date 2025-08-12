// API contracts
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  name: string;
  phone: string;
  token: string;
  isAuthenticated: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}
export interface RegisterResponse {
  name: string;
  phone: string;
  token: string;
}

// Mock API functions
export async function mockLoginApi(req: LoginRequest): Promise<LoginResponse> {
  await new Promise((res) => setTimeout(res, 1000)); // Simulate network delay
  if (req.email === 'test@example.com' && req.password === '123456') {
    return { name: 'Romina', phone: '+98******00', token: 'mock-token', isAuthenticated: true };
  }
  throw new Error('Invalid credentials');
}

export async function mockRegisterApi(req: RegisterRequest): Promise<RegisterResponse> {
  await new Promise((res) => setTimeout(res, 1000));
  if (req.email && req.password && req.name && req.phone) {
    return { name: req.name, phone: req.phone, token: 'mock-token' };
  }
  throw new Error('Missing fields');
} 