"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Package, Loader2, ArrowLeft, BarChart3, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { downloadCSV } from "@/lib/utils";
import Link from "next/link";

export default function InventoryReportPage() {
    const { data: inventory = [], isLoading } = useQuery({
        queryKey: ["reports", "inventory"],
        queryFn: async () => (await api.get("/reports/inventory")).data,
    });

    const handleExport = () => {
        const exportData = inventory.map((item: any) => ({
            "Product": item.name,
            "Category": item.category,
            "Stock": item.stock,
            "Unit Price": item.price,
            "Total Value": item.totalValue
        }));
        downloadCSV(exportData, `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const totalValuation = inventory.reduce((acc: number, item: any) => acc + item.totalValue, 0);
    const lowStockItems = inventory.filter((item: any) => item.stock <= 10).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory Report</h2>
                    <p className="text-muted-foreground text-sm">Real-time stock valuation and availability status.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Valuation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">₹{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium italic">
                            Based on Resale Price
                        </p>
                    </CardContent>
                    <div className="absolute top-0 right-0 h-full w-1 bg-emerald-500 transition-all group-hover:w-2"></div>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Stock Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{inventory.length} <span className="text-sm font-normal text-slate-400">Products</span></div>
                        <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit uppercase tracking-wider ${lowStockItems > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50'}`}>
                            {lowStockItems > 0 ? (
                                <><AlertTriangle className="h-3 w-3" /> {lowStockItems} Low Stock Alerts</>
                            ) : (
                                "All products well stocked"
                            )}
                        </div>
                    </CardContent>
                    <div className={`absolute top-0 right-0 h-full w-1 ${lowStockItems > 0 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all group-hover:w-2`}></div>
                </Card>

                <div className="flex flex-col justify-end">
                    <Button onClick={handleExport} className="h-14 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 shadow-xl hover:scale-[1.02] transition-transform active:scale-95">
                        <Download className="mr-2 h-5 w-5" />
                        Download Full Inventory CSV
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
                        <TableRow>
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest h-10">Product Name</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Category</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Stock</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Unit Price</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Total Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <p className="text-xs font-medium">Calculating stock valuation...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : inventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                    No products found in inventory.
                                </TableCell>
                            </TableRow>
                        ) : (
                            inventory.map((item: any) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                                            <span className="text-[10px] font-mono opacity-40 uppercase">ID: {item.id.substring(0, 8)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                            {item.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${item.stock <= 10 ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                                {item.stock}
                                            </span>
                                            {item.stock <= 10 && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                        ₹{item.price.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                                        ₹{item.totalValue.toFixed(2)}
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
