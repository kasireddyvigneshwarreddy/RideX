const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('ridex_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('ridex_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('ridex_token');
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Failed to parse JSON response from server',
  }));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// Concrete API calls
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (payload: any) =>
    apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => apiRequest<any>('/auth/me'),
  updateProfile: (data: any) =>
    apiRequest<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const ridesApi = {
  estimateFare: (params: {
    pickupLat: number;
    pickupLng: number;
    destLat: number;
    destLng: number;
    category?: string;
    couponCode?: string;
  }) =>
    apiRequest<any>('/rides/estimate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  createRide: (payload: any) =>
    apiRequest<any>('/rides', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRides: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.append('status', params.status);
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    return apiRequest<any>(`/rides?${qs.toString()}`);
  },
  getRideById: (id: string) => apiRequest<any>(`/rides/${id}`),
  cancelRide: (id: string, reason: string) =>
    apiRequest<any>(`/rides/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  rateRide: (id: string, data: { score: number; feedback?: string; tags?: string }) =>
    apiRequest<any>(`/rides/${id}/rating`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getReceipt: (id: string) => apiRequest<any>(`/rides/${id}/receipt`),
};

export const driverApi = {
  getRequests: () => apiRequest<any>('/driver/requests'),
  acceptRide: (rideId: string) =>
    apiRequest<any>(`/driver/rides/${rideId}/accept`, { method: 'POST' }),
  updateStatus: (rideId: string, payload: { status: string; otp?: string; note?: string }) =>
    apiRequest<any>(`/driver/rides/${rideId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  toggleAvailability: (payload: { isOnline?: boolean; isAvailable?: boolean }) =>
    apiRequest<any>('/driver/availability', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getEarnings: () => apiRequest<any>('/driver/earnings'),
};

export const adminApi = {
  getAnalytics: () => apiRequest<any>('/admin/analytics'),
  getUsers: (params?: { role?: string; search?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.role) qs.append('role', params.role);
    if (params?.search) qs.append('search', params.search);
    if (params?.page) qs.append('page', String(params.page));
    return apiRequest<any>(`/admin/users?${qs.toString()}`);
  },
  getDrivers: () => apiRequest<any>('/admin/drivers'),
  verifyDriver: (driverId: string, payload: { isVerified: boolean; notes?: string }) =>
    apiRequest<any>(`/admin/drivers/${driverId}/verification`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getFareRules: () => apiRequest<any>('/admin/fare-rules'),
  updateFareRule: (ruleId: string, payload: any) =>
    apiRequest<any>(`/admin/fare-rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  createCoupon: (payload: any) =>
    apiRequest<any>('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSupportTickets: () => apiRequest<any>('/admin/support-tickets'),
  updateSupportTicket: (ticketId: string, payload: { status?: string; adminNotes?: string }) =>
    apiRequest<any>(`/admin/support-tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

export const geocodeApi = {
  search: (query: string) => apiRequest<any>(`/geocode/search?q=${encodeURIComponent(query)}`),
  popular: () => apiRequest<any>('/geocode/popular'),
  reverse: (lat: number, lng: number) =>
    apiRequest<any>(`/geocode/reverse?lat=${lat}&lng=${lng}`),
};

export const couponsApi = {
  getCoupons: () => apiRequest<any>('/coupons'),
  validate: (code: string, rideAmountPaise: number) =>
    apiRequest<any>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, rideAmountPaise }),
    }),
};

export const addressesApi = {
  getAll: () => apiRequest<any>('/addresses'),
  add: (data: any) =>
    apiRequest<any>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<any>(`/addresses/${id}`, {
      method: 'DELETE',
    }),
};

export const notificationsApi = {
  getAll: () => apiRequest<any>('/notifications'),
  markRead: (id: string = 'all') =>
    apiRequest<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
};

export const supportApi = {
  create: (data: any) =>
    apiRequest<any>('/support', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyTickets: () => apiRequest<any>('/support'),
};
