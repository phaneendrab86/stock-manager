"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Repeat, Clock } from "lucide-react";
import { CustomBarChart, CustomLineChart } from "./Charts";

export const CustomerDashboard = ({ filters }: any) => {
    const { data: customerData, isLoading } = useQuery({
        queryKey: ["customerAnalytics", filters],
        queryFn: async () => {
            const { data } = await api.get("/analytics/customer", { params: filters });
            return data;
        },
    });

    if (isLoading) return <div>Loading Customer Analytics...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Top 10 Customers (by Visit Frequency)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={customerData?.topCustomers.map((c: any) => ({ name: c.name, visits: c.visits })) || []} xKey="name" yKey="visits" color="#8b5cf6" />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Top 10 Customers (by Revenue)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={customerData?.topCustomers.map((c: any) => ({ name: c.name, revenue: c.revenue })) || []} xKey="name" yKey="revenue" color="#10b981" />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Customer Visit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {customerData?.topCustomers.map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                        {c.name?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{c.name}</div>
                                        <div className="text-xs text-slate-500">{c.visits} Visits Recorded</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-emerald-600">₹{c.revenue.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Revenue</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
