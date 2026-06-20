"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingDown, FastForward, Table } from "lucide-react";
import { CustomBarChart, CustomDonutChart } from "./Charts";
import { Badge } from "@/components/ui/badge";

export const StockDashboard = ({ filters }: any) => {
    const { data: stockData, isLoading } = useQuery({
        queryKey: ["stockAnalytics", filters],
        queryFn: async () => {
            const { data } = await api.get("/analytics/stock", { params: filters });
            return data;
        },
    });

    if (isLoading) return <div>Loading Stock Analytics...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Inventory Value", value: `₹${stockData?.totalInventoryValue.toLocaleString()}`, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
                    { title: "Total Stock Qty", value: stockData?.totalStockQuantity.toLocaleString(), icon: Package, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { title: "Low Stock Items", value: stockData?.lowStockItems, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
                    { title: "Dead Stock Items", value: stockData?.deadStockItems, icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-50" },
                ].map((item, idx) => (
                    <Card key={idx} className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{item.title}</span>
                            <div className={`p-2 rounded-lg ${item.bg}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Top 10 Low Stock Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stockData?.topLowStockProducts.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-sm">{p.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {p.distributors?.[0]?.name || "No Distributor"} | {p.category?.name}
                                        </div>
                                    </div>
                                    <Badge variant={p.stock <= 5 ? "destructive" : "secondary"} className="font-mono">
                                        {p.stock}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Stock Distribution (Mock)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomDonutChart data={[
                            { name: 'FMCG', value: 400 },
                            { name: 'Tobacco', value: 300 },
                            { name: 'Beverages', value: 300 },
                        ]} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
