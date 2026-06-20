"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ArrowUpRight, ArrowDownLeft, RefreshCw, Loader2, History } from "lucide-react";
import { format } from "date-fns";

export default function StockHistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: transactions, isLoading } = useQuery({
        queryKey: ["stock-history"],
        queryFn: async () => {
            try {
                const { data } = await api.get("/products/transactions");
                return data as any[];
            } catch (e) {
                return [];
            }
        },
    });

    const filteredTransactions = transactions?.filter((t: any) =>
        t.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.note || t.reason || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTransactionBadge = (type: string) => {
        switch (type) {
            case "PURCHASE":
                return <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100"><ArrowDownLeft className="mr-1 h-3 w-3" /> Purchase</Badge>;
            case "SALE":
                return <Badge className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50 hover:bg-rose-100"><ArrowUpRight className="mr-1 h-3 w-3" /> Sale</Badge>;
            case "IN":
                return <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100"><ArrowDownLeft className="mr-1 h-3 w-3" /> Stock In</Badge>;
            case "OUT":
                return <Badge className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50 hover:bg-rose-100"><ArrowUpRight className="mr-1 h-3 w-3" /> Stock Out</Badge>;
            default:
                return <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-800"><RefreshCw className="mr-1 h-3 w-3" /> Adjustment</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Audit Trail</h2>
                <p className="text-muted-foreground text-sm">Historical record of all inventory reconciliations and movements.</p>
            </div>

            <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find by product, reason or note..."
                            className="pl-10 h-10 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest">Timestamp</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Inventory Item</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Type</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Delta</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Movement Context</TableHead>
                            <TableHead className="pr-6 text-right font-bold text-[10px] uppercase tracking-widest">Operator</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-20" />
                                </TableCell>
                            </TableRow>
                        ) : filteredTransactions?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <History className="h-10 w-10 opacity-10" />
                                        <p className="text-sm">No inventory activity recorded.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions?.map((tx: any) => (
                                <TableRow key={tx.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="pl-6 py-4">
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                            {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                                        </div>
                                        <div className="text-[9px] text-slate-400 tabular-nums">
                                            {format(new Date(tx.createdAt), "yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{tx.product.name}</TableCell>
                                    <TableCell>{getTransactionBadge(tx.type)}</TableCell>
                                    <TableCell className={`font-mono font-bold ${tx.quantity > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">{tx.note || tx.reason || "-"}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter shadow-inner">
                                            {tx.user?.name || "System"}
                                        </div>
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
