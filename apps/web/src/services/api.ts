import { api } from '../lib/api';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  Payment,
  Product,
  CreateProductDto,
  UpdateProductDto,
  DashboardStats,
  FinancialReport,
  TopService,
  TopSupplier,
  ReportsFilters,
  ServiceStats,
  Location,
  CreateLocationDto,
  UpdateLocationDto,
} from '../types/api';

// DTOs for API requests
export interface CreatePaymentDto {
  amount: number;
  description?: string;
  paymentMethod?: string;
  userId?: number;
}

export interface UpdatePaymentDto {
  amount?: number;
  description?: string;
  paymentMethod?: string;
  status?: 'PENDING' | 'PAID' | 'CANCELLED';
  userId?: number;
}

export interface MarkPaidDto {
  paymentMethod?: string;
}

// Users API
export const usersApi = {
  getAll: (
    page: number = 1,
    limit: number = 20,
    search?: string,
    role?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (role && role !== 'ALL') params.append('role', role);

    return api.get<{
      users: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/users?${params.toString()}`);
  },
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/users', data),
  update: (id: number, data: UpdateUserDto) =>
    api.patch<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  approve: (id: number, isApproved: boolean) =>
    api.patch<User>(`/users/${id}/approve`, { isApproved }),
  getSuppliersByStatus: (isApproved: boolean) =>
    api.get<User[]>(
      `/users/suppliers/approval-status?isApproved=${isApproved}`
    ),
  getUsersByRole: (role: string) => api.get<User[]>(`/users/by-role/${role}`),
};

// Services API
export const servicesApi = {
  getAll: (
    page: number = 1,
    limit: number = 20,
    search?: string,
    locationId?: number
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (locationId) params.append('locationId', locationId.toString());

    return api.get<{
      services: Service[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/services?${params.toString()}`);
  },
  getAllLegacy: () => api.get<Service[]>('/services/all'),
  getById: (id: number) => api.get<Service>(`/services/${id}`),
  create: (data: CreateServiceDto) => api.post<Service>('/services', data),
  update: (id: number, data: UpdateServiceDto) =>
    api.patch<Service>(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
  getPopular: (limit?: number) =>
    api.get<Service[]>(`/services/popular${limit ? `?limit=${limit}` : ''}`),
  getStats: (id: number) => api.get<ServiceStats>(`/services/${id}/stats`),
  searchUsers: (search?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    return api.get<
      {
        id: number;
        name: string;
        email: string;
        role: string;
        locationId?: number;
      }[]
    >(`/services/search-users${queryString ? `?${queryString}` : ''}`);
  },
};

// Payments API
export const paymentsApi = {
  getAll: (
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string;
      agencyId?: number;
      supplierId?: number;
      dateFrom?: string;
      dateTo?: string;
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) params.append('status', filters.status);
    if (filters?.agencyId)
      params.append('agencyId', filters.agencyId.toString());
    if (filters?.supplierId)
      params.append('supplierId', filters.supplierId.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    return api.get<{
      payments: Payment[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/payments?${params.toString()}`);
  },
  getById: (id: number) => api.get<Payment>(`/payments/${id}`),
  create: (data: CreatePaymentDto) => api.post<Payment>('/payments', data),
  update: (id: number, data: UpdatePaymentDto) =>
    api.patch<Payment>(`/payments/${id}`, data),
  markAsPaid: (id: number, data: MarkPaidDto) =>
    api.patch<Payment>(`/payments/${id}/mark-paid`, data),
  delete: (id: number) => api.delete(`/payments/${id}`),
  searchUsers: (search?: string, limit?: number, ignoreUserType?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());
    if (ignoreUserType) params.append('ignoreUserType', ignoreUserType);

    const queryString = params.toString();
    return api.get<
      {
        id: number;
        name: string;
        email: string;
        role: string;
        locationId: number | null;
        location: { id: number; city: string; state: string } | null;
      }[]
    >(`/payments/search-users${queryString ? `?${queryString}` : ''}`);
  },
  getFinancialReport: (filters?: {
    dateFrom?: string;
    dateTo?: string;
    agencyId?: number;
    supplierId?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.agencyId)
      params.append('agencyId', filters.agencyId.toString());
    if (filters?.supplierId)
      params.append('supplierId', filters.supplierId.toString());

    const queryString = params.toString();
    return api.get(
      `/payments/financial-report${queryString ? `?${queryString}` : ''}`
    );
  },
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get<DashboardStats>('/admin/dashboard/stats'),
  getTopServices: (limit?: number) =>
    api.get<TopService[]>(
      `/admin/dashboard/top-services${limit ? `?limit=${limit}` : ''}`
    ),
  getTopSuppliers: (limit?: number) =>
    api.get<TopSupplier[]>(
      `/admin/dashboard/top-suppliers${limit ? `?limit=${limit}` : ''}`
    ),
  getUsers: (filters?: {
    role?: string;
    isApproved?: boolean;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isApproved !== undefined)
      params.append('isApproved', filters.isApproved.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    return api.get<User[]>(
      `/admin/users${queryString ? `?${queryString}` : ''}`
    );
  },
  getUserById: (id: number) => api.get<User>(`/admin/users/${id}`),
  updateUser: (id: number, data: UpdateUserDto) =>
    api.patch<User>(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getFinancialReports: (filters?: ReportsFilters) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('from', filters.dateFrom);
    if (filters?.dateTo) params.append('to', filters.dateTo);
    if (filters?.agencyId)
      params.append('agencyId', filters.agencyId.toString());
    if (filters?.supplierId)
      params.append('supplierId', filters.supplierId.toString());

    const queryString = params.toString();
    return api.get<FinancialReport>(
      `/admin/reports/financial${queryString ? `?${queryString}` : ''}`
    );
  },
};

// Locations API
export const locationsApi = {
  getAll: () => api.get<Location[]>('/locations'),
  getById: (id: number) => api.get<Location>(`/locations/${id}`),
  create: (data: CreateLocationDto) => api.post<Location>('/locations', data),
  update: (id: number, data: UpdateLocationDto) =>
    api.patch<Location>(`/locations/${id}`, data),
  delete: (id: number) => api.delete(`/locations/${id}`),
};

// Products API
export const productsApi = {
  getAll: (
    page: number = 1,
    limit: number = 20,
    search?: string,
    serviceId?: number,
    isActive?: boolean,
    locationId?: number
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (serviceId) params.append('serviceId', serviceId.toString());
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    if (locationId) params.append('locationId', locationId.toString());

    return api.get<{
      products: Product[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/products?${params.toString()}`);
  },
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: CreateProductDto) => api.post<Product>('/products', data),
  update: (id: number, data: UpdateProductDto) =>
    api.patch<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  getByService: (serviceId: number) =>
    api.get<Product[]>(`/products/service/${serviceId}`),
  getStats: (id: number) =>
    api.get<{
      product: Product;
      stats: {
        totalOrders: number;
        totalRevenue: number;
        activeOrders: number;
      };
      recentOrders: Array<{
        id: number;
        quantity: number;
        totalAmount: number;
        status: string;
        customer: {
          id: number;
          name: string;
          email: string;
        };
        service: {
          id: number;
          name: string;
        };
        createdAt: string;
      }>;
    }>(`/products/${id}/stats`),
};
