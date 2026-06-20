"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    UserPlus,
    Filter,
    MoreVertical,
    Phone,
    MapPin,
    TrendingUp,
    AlertCircle,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { BillingType, CUSTOMER_TYPES } from "@/shared/types";
import { toast } from "sonner";
import Link from "next/link";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editCustomer, setEditCustomer] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [invoicesForCustomer, setInvoicesForCustomer] = useState<any[]>([]);
    const [checkingInvoices, setCheckingInvoices] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [search, typeFilter]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (typeFilter !== "all") params.append("type", typeFilter);

            const res = await api.get(`/customers?${params.toString()}`);
            setCustomers(res.data);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            toast.error("Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (data: any) => {
        setSubmitting(true);
        try {
            await api.post("/customers", data);
            toast.success("Customer added successfully");
            setIsAddModalOpen(false);
            fetchCustomers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add customer");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCustomer = (cust: any) => {
        setEditCustomer(cust);
        setIsEditModalOpen(true);
    };

    const handleUpdateCustomer = async (data: any) => {
        if (!editCustomer) return;
        setSubmitting(true);
        try {
            await api.put(`/customers/${editCustomer.id}`, data);
            toast.success("Customer updated");
            setIsEditModalOpen(false);
            setEditCustomer(null);
            fetchCustomers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update customer");
        } finally {
            setSubmitting(false);
        }
    };

    const checkCustomerInvoices = async (cust: any) => {
        setDeleteTarget(cust);
        setCheckingInvoices(true);
        setIsDeleteModalOpen(true);
        try {
            // Try fetching invoices for the customer. Backend should support this query param.
            const res = await api.get(`/invoices?customerId=${cust.id}`);
            setInvoicesForCustomer(res.data || []);
        } catch (err) {
            console.error(err);
            setInvoicesForCustomer([]);
        } finally {
            setCheckingInvoices(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/customers/${deleteTarget.id}`);
            toast.success("Customer deleted");
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
            setInvoicesForCustomer([]);
            fetchCustomers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete customer");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Customers</h2>
                    <p className="text-muted-foreground text-sm">Manage your customer relationships, credit, and performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl shadow-sm gap-2">
                                <UserPlus className="h-4 w-4" />
                                New Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Customer</DialogTitle>
                                <DialogDescription>Enter the details of the new customer below.</DialogDescription>
                            </DialogHeader>
                            <CustomerForm onSubmit={handleAddCustomer} loading={submitting} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="py-0 px-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or phone..."
                                className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                                        <SelectItem value="all">All Types</SelectItem>
                                        {CUSTOMER_TYPES.map((t) => (
                                            <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ').toLowerCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                            </Select>
                            <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                <Filter className="h-4 w-4 text-slate-500" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-2">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 p-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        </Card>
                    ))
                ) : customers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        No customers found matching your criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {customers.map((customer) => (
                            <Card key={customer.id} className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 hover:shadow-md hover:ring-primary/30 transition">
                                <CardContent className="py-0 px-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 flex-shrink-0">
                                                {customer.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <Link href={`/customers/${customer.id}`} className="font-semibold text-sm truncate block hover:text-primary">{customer.name}</Link>
                                                <div className="text-[11px] text-slate-500 truncate">{customer.phone || 'No phone'}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {/* Type badge with color per type */}
                                            {(() => {
                                                const t = customer.type;
                                                if (t === BillingType.WHOLESALE) return <Badge className="bg-blue-500 text-white">Wholesale</Badge>;
                                                if (t === BillingType.DELIVERY) return <Badge className="bg-violet-500 text-white">Delivery</Badge>;
                                                if (t === BillingType.WALK_AWAY) return <Badge className="bg-yellow-500 text-white">Walk away</Badge>;
                                                return <Badge className="bg-emerald-500 text-white">Resale</Badge>;
                                            })()}
                                            <div className={`text-sm font-mono font-bold ${customer.outstandingBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{customer.outstandingBalance.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-xs truncate">
                                            <span className="text-[10px] text-slate-400 mr-2">Status</span>
                                            {customer.isActive ? (
                                                <Badge className="bg-emerald-500 text-white">Active</Badge>
                                            ) : (
                                                <Badge className="bg-orange-500 text-white">Inactive</Badge>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <MoreVertical className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => checkCustomerInvoices(customer)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Customer Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>Update customer details.</DialogDescription>
                    </DialogHeader>
                    <CustomerForm initialData={editCustomer || undefined} onSubmit={handleUpdateCustomer} loading={submitting} />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation / History Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setInvoicesForCustomer([]); } setIsDeleteModalOpen(open); }}>
                <DialogContent className="max-w-xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                        <DialogDescription>Review bills and confirm deletion.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                        {checkingInvoices ? (
                            <div className="py-8 text-center">Checking bills...</div>
                        ) : (
                            <>
                                <p className="text-sm">Customer: <span className="font-semibold">{deleteTarget?.name}</span></p>
                                <div className="mt-3">
                                    {invoicesForCustomer.length === 0 ? (
                                        <p className="text-sm text-slate-500">No invoices found for this customer.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-sm font-bold">Invoice History</p>
                                            <div className="max-h-48 overflow-auto divide-y">
                                                {invoicesForCustomer.map((inv: any) => (
                                                    <div key={inv.id} className="flex justify-between py-2 text-sm">
                                                        <div>
                                                            <div className="font-medium">{inv.id}</div>
                                                            <div className="text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div>₹{inv.netAmount?.toFixed(2) || inv.totalAmount?.toFixed(2)}</div>
                                                            <div className="text-xs text-rose-500">{(inv.netAmount - (inv.paidAmount||0)) > 0 ? `Pending ₹${(inv.netAmount - (inv.paidAmount||0)).toFixed(2)}` : 'Cleared'}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); setInvoicesForCustomer([]); }}>Cancel</Button>
                                    <Button disabled={deleting} className="bg-rose-500 text-white" onClick={handleConfirmDelete}>Confirm Delete</Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
