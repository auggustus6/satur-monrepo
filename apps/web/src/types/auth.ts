export interface User {
  id: number;
  name: string;
  email: string;
  role: 'AGENCY' | 'SUPPLIER' | 'ADMIN' | 'CUSTOMER';
  phone?: string;
  photoUrl?: string;
  isApproved: boolean;
  address?: string;
  city?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  locationId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
