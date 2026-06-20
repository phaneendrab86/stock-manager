"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Phone, Mail, MapPin, ArrowLeft, History, Receipt, CreditCard, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

export default function DistributorDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Adjustment states
    const [amount, setAmount] = useState<string>("");
    const [type, setType] = useState<"DEBIT" | "CREDIT">("CREDIT");
    const [description, setDescription] = useState<string>("");

    const { data: distributor, isLoading: distLoading } = useQuery({
        queryKey: ["distributor", id],
        queryFn: async () => {
            const { data } = await api.get(`/distributors/${id}`);
            return data;
        },
    });

    const { data: ledger, isLoading: ledgerLoading } = useQuery({
        queryKey: ["distributor-ledger", id],
        queryFn: async () => {
            const { data } = await api.get(`/distributors/${id}/ledger`);
            return data as any[];
        },
    });

    if (distLoading) return <div className="flex h-96 items-center justify-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading Supplier Data...</div>;
    if (!distributor) return <div className="flex h-96 items-center justify-center text-rose-500 font-bold tracking-widest uppercase italic">Distributor not found.</div>;

                    const handleRecordAdjustment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/distributors/${id}/ledger`, {
                amount: parseFloat(amount),
                type,
                description: description || (type === "DEBIT" ? "Manual Debit Adjustment" : "Manual Credit Adjustment")
            });
            toast.success(type === "DEBIT" ? "Balance increased successfully" : "Payment/Adjustment recorded successfully");
            setIsAdjustmentModalOpen(false);
            setAmount("");
            setDescription("");
            setType("CREDIT");
            queryClient.invalidateQueries({ queryKey: ["distributor", id] });
            queryClient.invalidateQueries({ queryKey: ["distributor-ledger", id] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record adjustment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="hover:bg-indigo-50 text-indigo-600 font-black italic group uppercase tracking-widest text-xs">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Selection
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold italic uppercase tracking-widest text-[10px]">
                        Download Ledger (PDF)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 border-none shadow-2xl bg-indigo-600 text-white rounded-[32px] overflow-hidden self-start">
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-4 text-center border-b border-white/10 pb-8">
                            <div className="h-20 w-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                                <Building2 className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-black italic leading-tight">{distributor.name}</h2>
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-black text-[9px] uppercase tracking-widest py-1.5 px-4 rounded-full">
                                {distributor.gstNumber || "No GST Record"}
                            </Badge>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200/60 block italic">Current Outstanding</span>
                                <div className="text-4xl font-black italic tracking-tighter">₹{distributor.outstandingBalance.toLocaleString()}</div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-3 text-sm font-bold text-indigo-100 italic">
                                    <Phone className="h-4 w-4 opacity-50" />
                                    <span>{distributor.phone || "No Phone"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-indigo-100 italic">
                                    <Mail className="h-4 w-4 opacity-50" />
                                    <span>{distributor.email || "No Email"}</span>
                                </div>
                                <div className="flex items-start gap-3 text-xs font-bold text-indigo-100/80 leading-relaxed italic pr-4">
                                    <MapPin className="h-4 w-4 opacity-50 mt-0.5 shrink-0" />
                                    <span>{distributor.address || "No Address Provided"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200/60 block italic mb-3">Partner Brands</span>
                            <div className="flex flex-wrap gap-2">
                                {distributor.brands?.map((brand: any) => (
                                    <span key={brand.id} className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest italic">{brand.name}</span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-xl bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden border border-slate-100">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 italic">Transaction Ledger</span>
                        </div>
                        <Dialog open={isAdjustmentModalOpen} onOpenChange={setIsAdjustmentModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase text-[10px] tracking-wider border-slate-200 hover:bg-slate-50">
                                    Record Transaction / Adjust
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-left font-black uppercase tracking-tight text-slate-900 dark:text-white">Record Transaction</DialogTitle>
                                    <DialogDescription className="text-left">
                                        Manually adjust outstanding balance or record a payment to this supplier.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRecordAdjustment} className="space-y-4 pt-4 text-left">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs">Adjustment Type</Label>
                                        <Select value={type} onValueChange={(v) => setType(v as "DEBIT" | "CREDIT")}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CREDIT">Payment / Credit (Reduces Balance -)</SelectItem>
                                                <SelectItem value="DEBIT">Purchase / Debit (Increases Balance +)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs">Amount (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs">Description / Note</Label>
                                        <Textarea
                                            placeholder="Describe this adjustment..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold" disabled={submitting}>
                                        {submitting ? "Processing..." : (type === "DEBIT" ? "Increase Balance" : "Record Payment / Credit")}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
                                <TableRow>
                                    <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Date & Reference</TableHead>
                                    <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Description</TableHead>
                                    <TableHead className="py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Debit (+)</TableHead>
                                    <TableHead className="py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Credit (-)</TableHead>
                                    <TableHead className="pr-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-510 dark:text-slate-200">Running Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledgerLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 font-bold text-slate-300 italic uppercase tracking-widest">Auditing Transactions...</TableCell>
                                    </TableRow>
                                ) : ledger?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">No transactions recorded for this supplier.</TableCell>
                                    </TableRow>
                                ) : (
                                    ledger?.map((entry) => (
                                        <TableRow key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                                            <TableCell className="pl-8 py-5">
                                                <div className="font-bold text-slate-600 dark:text-slate-400 text-xs italic">{new Date(entry.date).toLocaleDateString()}</div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{entry.id.substring(0, 8)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm italic">{entry.description}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {entry.debit > 0 && <span className="font-black text-rose-500 italic">₹{entry.debit.toLocaleString()}</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {entry.credit > 0 && <span className="font-black text-emerald-500 italic">₹{entry.credit.toLocaleString()}</span>}
                                            </TableCell>
                                            <TableCell className="pr-8 text-right">
                                                <span className="font-black text-slate-900 dark:text-slate-100 tracking-tighter text-md">₹{entry.balance.toLocaleString()}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
