import type {
  Organization,
  User,
  Client,
  Service,
  Subscription,
  Payment,
  AlertLog,
  SubscriptionHistory,
  ServiceCategory,
  SubscriptionStatus,
  PaymentStatus,
  PaymentMethod,
  Role,
  Plan,
} from "@prisma/client";

// Re-export prisma enums
export type {
  ServiceCategory,
  SubscriptionStatus,
  PaymentStatus,
  PaymentMethod,
  Role,
  Plan,
};

// ─────────────────────────────────────────
// Extended types (with relations)
// ─────────────────────────────────────────

export type ClientWithCounts = Client & {
  _count: {
    subscriptions: number;
    payments: number;
  };
};

export type SubscriptionWithRelations = Subscription & {
  client: Pick<Client, "id" | "name" | "email" | "phone">;
  service: Pick<Service, "id" | "name" | "category" | "iconUrl">;
  payments: Payment[];
};

export type ClientWithSubscriptions = Client & {
  subscriptions: SubscriptionWithRelations[];
  payments: Payment[];
};

export type PaymentWithRelations = Payment & {
  client: Pick<Client, "id" | "name">;
  subscription: (Pick<Subscription, "id" | "expiryDate"> & {
    service: Pick<Service, "name" | "category">;
  }) | null;
};

// ─────────────────────────────────────────
// Dashboard analytics
// ─────────────────────────────────────────

export interface DashboardStats {
  totalClients: number;
  activeSubscriptions: number;
  expiringSoon: number;
  expiredCount: number;
  totalRevenue: number;
  pendingPayments: number;
  mrr: number;
  revenueThisMonth: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  count: number;
}

export interface SubscriptionsByCategory {
  category: ServiceCategory;
  count: number;
  revenue: number;
}

// ─────────────────────────────────────────
// API response types
// ─────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─────────────────────────────────────────
// Form input types (Zod-validated)
// ─────────────────────────────────────────

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CreateSubscriptionInput {
  clientId: string;
  serviceId: string;
  purchaseDate: string;
  durationDays: number;
  salePrice: number;
  credentials?: string;
  notes?: string;
  autoRenew?: boolean;
}

export interface RenewSubscriptionInput {
  subscriptionId: string;
  durationDays: number;
  salePrice: number;
  purchaseDate?: string;
}

export interface CreatePaymentInput {
  clientId: string;
  subscriptionId?: string;
  amount: number;
  method?: PaymentMethod;
  paidAt?: string;
  note?: string;
}

export interface CreateServiceInput {
  name: string;
  category: ServiceCategory;
  description?: string;
  costPrice?: number;
}
