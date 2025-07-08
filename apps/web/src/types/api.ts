// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  role: 'AGENCY' | 'SUPPLIER' | 'ADMIN' | 'CUSTOMER';
  isApproved: boolean;
  address?: string;
  city?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  locationId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  photoUrl?: string;
  role?: 'AGENCY' | 'SUPPLIER' | 'ADMIN' | 'CUSTOMER';
  address?: string;
  city?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  locationId?: number;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  role?: 'AGENCY' | 'SUPPLIER' | 'ADMIN' | 'CUSTOMER';
  address?: string;
  city?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  locationId?: number;
}

// Service types
export interface Service {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  locationId: number;
  location?: {
    id: number;
    city: string;
    state: string;
  };
  users?: Array<{
    id: number;
    name: string;
    role: string;
    email: string;
    locationId: number | null;
    location?: {
      id: number;
      city: string;
      state: string;
    } | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  locationId: number;
  isActive?: boolean;
  userIds?: number[];
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  locationId?: number;
  isActive?: boolean;
  userIds?: number[];
}

export interface ManageServiceUsersDto {
  userIds: number[];
}

// Payment types
export interface Payment {
  id: number;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  description?: string;
  paymentMethod?: string;
  paidAt?: string;
  processedById?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  processedBy?: User;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Error types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  users: {
    total: number;
    agencies: number;
    approvedSuppliers: number;
    pendingSuppliers: number;
  };
  services: {
    total: number;
  };
  financial: {
    totalPayments: number;
    totalRevenue: number;
    averagePayment: number;
  };
}

// Financial Report Types
export interface FinancialReportSummary {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  cancelledPayments: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  totalCancelledAmount: number;
  averageTransactionValue: number;
}

export interface MonthlyData {
  [month: string]: {
    totalAmount: number;
    transactionCount: number;
  };
}

export interface FinancialReport {
  summary: FinancialReportSummary;
  monthlyData: MonthlyData;
  period: {
    from: string | null;
    to: string | null;
  };
}

// Top Services and Suppliers Types
export interface TopService {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  locationId: number;
}

export interface TopSupplier {
  id: number;
  name: string;
  email: string;
  isApproved: boolean;
}

// Reports Filter Types
export interface ReportsFilters {
  dateFrom?: string;
  dateTo?: string;
  agencyId?: number;
  supplierId?: number;
}

export interface ServiceStats {
  totalRequests: number;
  totalRevenue: number;
  averagePrice: number;
}

// Location types
export interface Location {
  id: number;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  city: string;
  state: string;
}

export interface UpdateLocationDto {
  city?: string;
  state?: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number; // Price in centavos
  currency: 'BRL' | 'USD' | 'EUR';
  stripeProductId?: string;
  stripePriceId?: string;
  serviceId: number;
  service?: {
    id: number;
    name: string;
    location?: {
      id: number;
      city: string;
      state: string;
    };
    users?: Array<{
      id: number;
      name: string;
      role: string;
      email: string;
      locationId: number | null;
      location?: {
        id: number;
        city: string;
        state: string;
      } | null;
    }>;
  };
  isActive: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number; // Price in centavos
  currency?: 'BRL' | 'USD' | 'EUR';
  serviceId: number;
  stripeProductId?: string;
  stripePriceId?: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number; // Price in centavos
  currency?: 'BRL' | 'USD' | 'EUR';
  serviceId?: number;
  stripeProductId?: string;
  stripePriceId?: string;
  isActive?: boolean;
}
