export enum RoleType {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    BILLING_STAFF = 'BILLING_STAFF',
}

export enum BrandType {
    BRANDED = 'BRANDED',
    UNBRANDED = 'UNBRANDED',
}

export enum BillingType {
    RESALE = 'RESALE',
    WHOLESALE = 'WHOLESALE',
    WALK_AWAY = 'WALK_AWAY',
    DELIVERY = 'DELIVERY',
    RETAIL = 'RETAIL',
}

export const CUSTOMER_TYPES = Object.values(BillingType) as BillingType[];

export enum PaymentMode {
    CASH = 'CASH',
    UPI = 'UPI',
    BANK = 'BANK',
    CREDIT = 'CREDIT',
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
