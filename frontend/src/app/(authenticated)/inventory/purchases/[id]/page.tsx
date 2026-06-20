"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Calendar, Building2, Package, ArrowLeft, Printer, CreditCard, CheckCircle2, AlertCircle, History, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";

export default function PurchaseDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const { data: purchase, isLoading } = useQuery({
        queryKey: ["purchase", id],
        queryFn: async () => {
            const { data } = await api.get(`/purchases/${id}`);
            return data;
        },
    });

    const { register, handleSubmit, reset } = useForm({
        defaultValues: { amount: 0, paymentMode: "Cash", note: "" }
    });

    const paymentMutation = useMutation({
        mutationFn: (data: any) => api.post(`/purchases/${id}/payments`, data),
        onSuccess: () => {
            toast.success("Payment recorded successfully!");
            queryClient.invalidateQueries({ queryKey: ["purchase", id] });
            setIsPaymentDialogOpen(false);
            reset();
        },
        onError: () => toast.error("Failed to record payment"),
    });

    if (isLoading) return <div className="flex h-96 items-center justify-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Verifying Invoice...</div>;
    if (!purchase) return <div className="flex h-96 items-center justify-center text-rose-500 font-bold">Purchase not found.</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="hover:bg-indigo-50 text-indigo-600 font-bold group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to History
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                    {purchase.pendingAmount > 0 && (
                        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 font-bold">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Make Payment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                                <div className="bg-indigo-600 p-8 text-white">
                                    <h3 className="text-xl font-black italic">Record Payment</h3>
                                    <p className="text-indigo-100 text-xs mt-1 font-medium italic opacity-80">Reducing debt for {purchase.invoiceNumber}</p>
                                </div>
                                <form onSubmit={handleSubmit(data => paymentMutation.mutate(data))} className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Amount</Label>
                                        <Input type="number" {...register("amount", { valueAsNumber: true, max: purchase.pendingAmount })} max={purchase.pendingAmount} className="h-12 border-slate-200 focus:ring-indigo-500/20 rounded-xl font-bold text-lg" />
                                        <p className="text-[10px] text-slate-400 font-bold italic">Max: ₹{purchase.pendingAmount}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</Label>
                                        <select {...register("paymentMode")} className="w-full h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none">
                                            {["Cash", "UPI", "Bank Transfer"].map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note</Label>
                                        <Input {...register("note")} placeholder="Any reference..." className="h-12 border-slate-200 focus:ring-indigo-500/20 rounded-xl" />
                                    </div>
                                    <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg border-none">
                                        Confirm Payment
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-100">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                                <Receipt className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">{purchase.invoiceNumber}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest border-none ${purchase.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {purchase.status}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(purchase.purchaseDate).toDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20">
                                <TableRow>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Item Details</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Unit</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Price</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchase.items.map((item: any) => (
                                    <TableRow key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-slate-100">{item.product.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">{item.product.sku}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold text-[10px] uppercase border-none">
                                                {item.unitId} {/* Ideally join with Unit name but unitId is ok for now if short */}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-black text-slate-700 dark:text-slate-300">{item.quantity}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-600 dark:text-slate-400">₹{item.purchasePrice.toLocaleString()}</TableCell>
                                        <TableCell className="text-right px-6 font-black text-slate-900 dark:text-slate-100">₹{item.totalAmount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-indigo-600 text-white rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 italic">Distributor</span>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <span className="text-xl font-black italic">{purchase.distributor.name}</span>
                                    </div>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 block italic">Total Paid</span>
                                        <span className="text-2xl font-black italic">₹{purchase.paidAmount.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 block italic">Outstanding</span>
                                        <span className="text-2xl font-black italic text-rose-300">₹{purchase.pendingAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-100">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <History className="h-4 w-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Payment History</span>
                        </div>
                        <CardContent className="p-4">
                            {purchase.payments?.length === 0 ? (
                                <p className="text-xs text-slate-400 font-bold italic py-4 text-center">No payment history available.</p>
                            ) : (
                                <div className="space-y-4">
                                    {purchase.payments.map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-start group">
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 italic">₹{p.amount.toLocaleString()}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.paymentMode} • {new Date(p.paymentDate).toLocaleDateString()}</div>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
