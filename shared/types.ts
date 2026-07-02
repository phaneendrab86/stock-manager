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
export interface Brand {
    id: string;
    name: string;
    type: BrandType;
    createdAt: Date;
    updatedAt: Date;
}

export interface Customer {
    id: string;
    name: string;
    type: BillingType;
    createdAt: Date;
    updatedAt: Date;
}

export interface Expense {
    id: string;
    name: string;
    amount: number;
    status: ExpenseStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    name: string;
    brand: Brand;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}   
export interface Order {
    id: string;
    customer: Customer;
    products: Product[];
    totalAmount: number;
    paymentMode: PaymentMode;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrderProduct {
    product: Product;
    quantity: number;
}
export interface OrderResponse {
    id: string;
    customer: Customer;
    products: OrderProduct[];
    totalAmount: number;
    paymentMode: PaymentMode;
    createdAt: Date;
    updatedAt: Date;
}   
export interface ExpenseResponse {
    id: string;
    name: string;
    amount: number;
    status: ExpenseStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface CustomerResponse {
    id: string;
    name: string;
    type: BillingType;
    createdAt: Date;
    updatedAt: Date;
}
export interface BrandResponse {
    id: string;
    name: string;
    type: BrandType;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProductResponse {
    id: string;
    name: string;
    brand: BrandResponse;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    roles: RoleResponse[];
    createdAt: Date;
    updatedAt: Date;
}
export interface RoleResponse {
    id: string;
    name: RoleType;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface CreateUserRequest {
    email: string;
    name: string;
    password: string;
    roles: RoleType[];
}
export interface CreateBrandRequest {
    name: string;
    type: BrandType;
}
export interface CreateCustomerRequest {
    name: string;
    type: BillingType;
}
export interface CreateProductRequest {
    name: string;
    brandId: string;
    price: number;
}
export interface CreateOrderRequest {
    customerId: string;
    products: OrderProduct[];
    paymentMode: PaymentMode;
}   
export interface CreateExpenseRequest {
    name: string;
    amount: number;
}
export interface UpdateUserRequest {
    email: string;
    name: string;
    isActive: boolean;
    roles: RoleType[];
}
export interface UpdateBrandRequest {
    name: string;
    type: BrandType;
}
export interface UpdateCustomerRequest {
    name: string;
    type: BillingType;
}
export interface UpdateProductRequest {
    name: string;
    brandId: string;
    price: number;
}
export interface UpdateOrderRequest {
    customerId: string;
    products: OrderProduct[];
    paymentMode: PaymentMode;
}
export interface UpdateExpenseRequest {
    name: string;
    amount: number;
}
export interface DeleteRequest {
    id: string;
}
export interface PaginationRequest {
    page: number;
    limit: number;
}
export interface SearchRequest {
    query: string;
}   
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
export interface ErrorResponse {
    message: string;
    statusCode: number;
}
export interface SuccessResponse {
    message: string;
    statusCode: number;
}
export interface AuthErrorResponse {
    message: string;
    statusCode: number;
}
export interface AuthSuccessResponse {
    message: string;
    statusCode: number;
    data: AuthResponse;
}
export interface UserErrorResponse {
    message: string;
    statusCode: number;
}
export interface UserSuccessResponse {
    message: string;
    statusCode: number;
    data: UserResponse;
}
export interface UsersErrorResponse {
    message: string;
    statusCode: number;
}
export interface UsersSuccessResponse {
    message: string;
    statusCode: number;
    data: PaginatedResponse<UserResponse>;
}
export interface BrandErrorResponse {
    message: string;
    statusCode: number;
}
export interface BrandSuccessResponse {
    message: string;
    statusCode: number;
    data: BrandResponse;
}
export interface BrandsErrorResponse {
    message: string;
    statusCode: number;
}
export interface BrandsSuccessResponse {
    message: string;
    statusCode: number;
    data: PaginatedResponse<BrandResponse>;
}

