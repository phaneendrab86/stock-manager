"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Wallet, PieChart } from "lucide-react";
import { CustomAreaChart, CustomDonutChart, CustomBarChart } from "./Charts";

export const RevenueDashboard = ({ filters }: any) => {
    const { data: revenueData, isLoading } = useQuery({
        queryKey: ["revenueAnalytics", filters],
        queryFn: async () => {
            const { data } = await api.get("/analytics/revenue", { params: filters });
            return data;
        },
    });

    if (isLoading) return <div>Loading Revenue Analytics...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                    { title: "Total Revenue", value: `₹${revenueData?.revenueSplit.reduce((a: any, b: any) => a + b.amount, 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { title: "Profit (Est.)", value: `₹${(revenueData?.revenueSplit.reduce((a: any, b: any) => a + b.amount, 0) * 0.15).toLocaleString()}`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
                    { title: "Expenses", value: `₹0`, icon: Wallet, color: "text-rose-500", bg: "bg-rose-50" },
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

            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomAreaChart data={revenueData?.revenueTrend || []} xKey="date" yKey="revenue" color="#10b981" />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Wholesale vs Retail Split</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomDonutChart data={revenueData?.revenueSplit.map((s: any) => ({ name: s.type, value: s.amount })) || []} />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Expenses vs Revenue (Est.)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={[
                            { name: 'Revenue', value: revenueData?.revenueSplit.reduce((a: any, b: any) => a + b.amount, 0) || 0 },
                            { name: 'Expenses', value: 0 },
                        ]} xKey="name" yKey="value" color="#ef4444" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
