"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    History,
    TrendingUp,
    CreditCard,
    Ticket,
    Phone,
    MapPin,
    Mail,
    Calendar,
    ArrowLeft,
    DollarSign,
    ShoppingCart,
    Clock,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CustomAreaChart, CustomBarChart } from "@/components/analytics/Charts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import api from "@/lib/api";
import { toast } from "sonner";

export default function CustomerProfilePage() {
    const { id } = useParams();
    const { activeRole } = useAuth();
    const [customer, setCustomer] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Payment record state
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [paymentMode, setPaymentMode] = useState<string>("CASH");
    const [paymentNote, setPaymentNote] = useState<string>("");
    const [paymentType, setPaymentType] = useState<"DEBIT" | "CREDIT">("CREDIT");

    const isAdmin = activeRole?.name === "Admin";
    const canViewProfit = isAdmin || activeRole?.name === "Manager";

    useEffect(() => {
        if (id) {
            fetchCustomerData();
        }
    }, [id]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            const [custRes, profRes] = await Promise.all([
                api.get(`/customers/${id}`),
                api.get(`/customers/${id}/profile`)
            ]);
            setCustomer(custRes.data);
            setProfile(profRes.data);
        } catch (error) {
            console.error("Failed to fetch customer data:", error);
            toast.error("Failed to load customer profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCustomer = async (data: any) => {
        setSubmitting(true);
        try {
            await api.patch(`/customers/${id}`, data);
            toast.success("Customer updated successfully");
            setIsEditModalOpen(false);
            fetchCustomerData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update customer");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/customers/${id}/ledger`, {
                amount: parseFloat(paymentAmount),
                type: paymentType,
                description: paymentNote || (paymentType === "DEBIT" ? "Manual Debit Adjustment" : "Manual Credit Adjustment"),
                paymentMode: paymentType === "CREDIT" ? paymentMode : undefined
            });
            toast.success(paymentType === "DEBIT" ? "Balance increased successfully" : "Payment recorded successfully");
            setIsPaymentModalOpen(false);
            setPaymentAmount("");
            setPaymentNote("");
            setPaymentType("CREDIT");
            fetchCustomerData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to adjust balance");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading customer profile...</div>;
    if (!customer) return <div className="p-8">Customer not found.</div>;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/customers">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{customer.name}</h2>
                    <Badge variant="secondary" className="rounded-full px-3">{customer.type}</Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="md:col-span-1 border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50">
                    <CardHeader className="pb-4">
                        <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border border-primary/20 mb-4 mx-auto">
                            {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <CardTitle className="text-center">{customer.name}</CardTitle>
                        <CardDescription className="text-center">{customer.businessName || "Individual"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Phone className="h-4 w-4" />
                                </div>
                                {customer.phone || "N/A"}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                {customer.address || "No address"}
                            </div>
                            {customer.gstNumber && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Briefcase className="h-4 w-4" />
                                    </div>
                                    {customer.gstNumber}
                                </div>
                            )}
                        </div>

                        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full rounded-xl mt-4" variant="outline">Edit Profile</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle>Edit Customer Profile</DialogTitle>
                                    <DialogDescription>Update the details for {customer.name}.</DialogDescription>
                                </DialogHeader>
                                <CustomerForm
                                    initialData={customer}
                                    onSubmit={handleUpdateCustomer}
                                    loading={submitting}
                                />
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <DollarSign className="h-12 w-12" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{profile.totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-slate-400 mt-1">Average ₹{profile.avgBill.toFixed(2)} / bill</p>
                            </CardContent>
                        </Card>
                        {canViewProfit && (
                            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <TrendingUp className="h-12 w-12 text-emerald-500" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Profit</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600">₹{profile.totalProfit.toLocaleString()}</div>
                                    <p className="text-xs text-slate-400 mt-1">From {profile.visitCount} visits</p>
                                </CardContent>
                            </Card>
                        )}
                        <Card className="border-none shadow-sm ring-1 ring-rose-200/50 dark:ring-rose-800/50 bg-white dark:bg-rose-900/10 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <CreditCard className="h-12 w-12 text-rose-500" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-rose-500/70">Outstanding</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-rose-600 font-mono">₹{customer.outstandingBalance.toLocaleString()}</div>
                                <p className="text-xs text-slate-400 mt-1">Limit: ₹{customer.creditLimit?.toLocaleString() || 0}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl h-11 inline-flex items-center gap-1">
                            <TabsTrigger value="overview" className="rounded-xl px-6 h-9 transition-all gap-2">
                                <Clock className="h-4 w-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-xl px-6 h-9 transition-all gap-2">
                                <History className="h-4 w-4" /> History
                            </TabsTrigger>
                            <TabsTrigger value="payments" className="rounded-xl px-6 h-9 transition-all gap-2">
                                <CreditCard className="h-4 w-4" /> Payments
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recent Purchases</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {customer.invoices.map((inv: any) => (
                                            <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50">
                                                <div>
                                                    <p className="font-bold text-sm">#{inv.id.substring(0, 8)}</p>
                                                    <p className="text-[10px] text-slate-400">{format(new Date(inv.createdAt), 'dd MMM yyyy')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-sm">₹{inv.netAmount.toLocaleString()}</p>
                                                    <Badge variant="outline" className="text-[10px] h-4">{inv.paymentStatus}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Insights</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Most Profitable Product</p>
                                            <p className="text-lg font-bold">{profile.mostProfitableProduct || "N/A"}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/50">
                                            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Last Visit</p>
                                            <p className="text-lg font-bold">{profile.lastVisitDate ? format(new Date(profile.lastVisitDate), 'PPP') : "Never"}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-4">
                            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50">
                                <CardContent className="p-0 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="text-left py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Invoice</th>
                                                <th className="text-left py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Date</th>
                                                <th className="text-left py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Type</th>
                                                <th className="text-right py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Amount</th>
                                                {canViewProfit && <th className="text-right py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Profit</th>}
                                                <th className="text-center py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {customer.invoices.map((inv: any) => (
                                                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="py-4 px-6 font-mono font-bold text-xs text-primary">#{inv.id.substring(0, 8)}</td>
                                                    <td className="py-4 px-6">{format(new Date(inv.createdAt), 'dd MMM yy')}</td>
                                                    <td className="py-4 px-6">
                                                        <Badge variant="outline" className="text-[10px] h-5">{inv.billingType}</Badge>
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-bold">₹{inv.netAmount.toLocaleString()}</td>
                                                    {canViewProfit && (
                                                        <td className="py-4 px-6 text-right font-bold text-emerald-600">₹{inv.profit?.toLocaleString() || 0}</td>
                                                    )}
                                                    <td className="py-4 px-6 text-center">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                            {inv.paymentStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payments" className="mt-4">
                            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Ledger & Payments</CardTitle>
                                        <CardDescription>History of adjustments and payments.</CardDescription>
                                    </div>
                                    <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="rounded-xl" variant="outline" size="sm">Record Payment / Adjust Balance</Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Record Payment / Adjust Balance</DialogTitle>
                                                <DialogDescription>Manually adjust this customer's balance or record a payment.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleRecordPayment} className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label>Adjustment Type</Label>
                                                    <Select value={paymentType} onValueChange={(v) => setPaymentType(v as "DEBIT" | "CREDIT")}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="CREDIT">Payment / Credit (Reduces Balance -)</SelectItem>
                                                            <SelectItem value="DEBIT">Add Balance / Debit (Increases Balance +)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Amount (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={paymentAmount}
                                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {paymentType === "CREDIT" && (
                                                    <div className="space-y-2">
                                                        <Label>Payment Mode</Label>
                                                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CASH">Cash</SelectItem>
                                                                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                                <SelectItem value="UPI">UPI</SelectItem>
                                                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Label>Description / Note</Label>
                                                    <Textarea
                                                        placeholder="Describe this adjustment..."
                                                        value={paymentNote}
                                                        onChange={(e) => setPaymentNote(e.target.value)}
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full rounded-xl" disabled={submitting}>
                                                    {submitting ? "Processing..." : (paymentType === "DEBIT" ? "Add Balance" : "Confirm Payment")}
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent className="p-0 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="text-left py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Date</th>
                                                <th className="text-left py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Description</th>
                                                <th className="text-right py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Debit (+)</th>
                                                <th className="text-right py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Credit (-)</th>
                                                <th className="text-right py-4 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {customer.ledgerEntries.map((entry: any) => (
                                                <tr key={entry.id}>
                                                    <td className="py-4 px-6">{format(new Date(entry.date), 'dd MMM yy')}</td>
                                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{entry.description}</td>
                                                    <td className="py-4 px-6 text-right font-mono text-rose-500">{entry.debit > 0 ? `+₹${entry.debit.toLocaleString()}` : '-'}</td>
                                                    <td className="py-4 px-6 text-right font-mono text-emerald-500">{entry.credit > 0 ? `-₹${entry.credit.toLocaleString()}` : '-'}</td>
                                                    <td className="py-4 px-6 text-right font-mono font-bold">₹{entry.balance.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
