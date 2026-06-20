export enum RoleType {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    BILLING_STAFF = 'BILLING_STAFF',
}

export enum VisitStatus {
    COMPLETED = 'COMPLETED',
    FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED',
    ORDER_CONFIRMED = 'ORDER_CONFIRMED',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
}

export enum BillingType {
    WHOLESALE = 'WHOLESALE',
    RESALE = 'RESALE',
    WALK_AWAY = 'WALK_AWAY',
    DELIVERY = 'DELIVERY',
}

export const CUSTOMER_TYPES = Object.values(BillingType) as BillingType[];

export enum PaymentMode {
    CASH = 'CASH',
    UPI = 'UPI',
    CREDIT = 'CREDIT',
    MIXED = 'MIXED',
}

export enum ExpenseStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface User {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Role {
    id: string;
    name: RoleType;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}
