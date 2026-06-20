"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Search, Receipt, Calendar, Building2, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function PurchasesPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: purchases, isLoading } = useQuery({
        queryKey: ["purchases"],
        queryFn: async () => {
            const { data } = await api.get("/purchases");
            return data as any[];
        },
    });

    const filteredPurchases = purchases?.filter((p: any) =>
        p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.distributor?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 italic">Purchase History</h2>
                    <p className="text-muted-foreground">Track all stock intakes and invoice details.</p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 rounded-xl px-6 h-12 transition-all hover:scale-[1.02]">
                    <Link href="/inventory/purchases/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Purchase
                    </Link>
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by invoice number or distributor..."
                            className="pl-10 h-11 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl focus-visible:ring-indigo-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="border-b border-slate-100 dark:border-slate-800">
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4">Invoice info</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4">Distributor</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 text-center">Date</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Amount</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 text-center">Status</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 font-medium text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-10 w-10 animate-spin text-indigo-400 opacity-20" />
                                        <p className="text-xs uppercase tracking-widest font-bold">Loading Purchases...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredPurchases?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <Receipt className="h-12 w-12 opacity-5" />
                                        <p className="text-sm font-medium">No purchase records found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPurchases?.map((purchase: any) => (
                                <TableRow key={purchase.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <TableCell className="pl-6 py-5">
                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-md leading-tight tracking-tight flex items-center gap-2">
                                            <Receipt className="h-4 w-4 text-indigo-500" />
                                            {purchase.invoiceNumber}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            {purchase.items?.length || 0} Items Included
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="font-bold">{purchase.distributor?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full inline-block">
                                            {new Date(purchase.purchaseDate).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-slate-100">
                                                ₹{purchase.totalAmount.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border-none ${purchase.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                                    purchase.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                }`}
                                        >
                                            {purchase.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 group/btn" asChild>
                                            <Link href={`/inventory/purchases/${purchase.id}`}>
                                                <ChevronRight className="h-4 w-4 text-slate-400 group-hover/btn:text-indigo-600 transition-colors" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
