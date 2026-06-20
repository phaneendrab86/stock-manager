"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockDashboard } from "@/components/analytics/StockDashboard";
import { RevenueDashboard } from "@/components/analytics/RevenueDashboard";
import { ProductDashboard } from "@/components/analytics/ProductDashboard";
import { CustomerDashboard } from "@/components/analytics/CustomerDashboard";
import { Calendar, Download, Filter, Package, DollarSign, ShoppingBag, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { startOfMonth, endOfMonth, format, subDays } from "date-fns";

export default function AnalyticsPage() {
    const { activeRole } = useAuth();
    const [filters, setFilters] = useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        categoryId: "",
        distributorId: "",
    });

    const isAdmin = activeRole?.name === "Admin";
    const isManager = activeRole?.name === "Manager";
    const canViewRevenue = isAdmin || isManager;

    const { data: distributors } = useQuery({
        queryKey: ["distributors"],
        queryFn: async () => (await api.get("/distributors")).data,
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => (await api.get("/categories")).data,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white italic">Business Analytics</h2>
                    <p className="text-muted-foreground text-sm">Real-time insights across stock, revenue, and customer trends.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select onValueChange={(val) => setFilters(f => ({ ...f, distributorId: val === "all" ? "" : val }))}>
                        <SelectTrigger className="w-[180px] h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
                            <Filter className="mr-2 h-4 w-4 text-primary" />
                            <SelectValue placeholder="All Suppliers" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                            <SelectItem value="all">All Suppliers</SelectItem>
                            {distributors?.map((d: any) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(val) => setFilters(f => ({ ...f, categoryId: val === "all" ? "" : val }))}>
                        <SelectTrigger className="w-[160px] h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
                            <Package className="mr-2 h-4 w-4 text-primary" />
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories?.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select defaultValue="30d">
                        <SelectTrigger className="w-[160px] h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last 90 Days</SelectItem>
                            <SelectItem value="ytd">Year to Date</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl px-4">
                        <Download className="mr-2 h-4 w-4 text-slate-500" />
                        Export
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="stock" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-900 border-none p-1 rounded-2xl h-12 inline-flex items-center gap-1 shadow-sm">
                    <TabsTrigger value="stock" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-10 transition-all gap-2">
                        <Package className="h-4 w-4" /> Stock
                    </TabsTrigger>
                    {canViewRevenue && (
                        <TabsTrigger value="revenue" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-10 transition-all gap-2">
                            <DollarSign className="h-4 w-4" /> Revenue
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="products" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-10 transition-all gap-2">
                        <ShoppingBag className="h-4 w-4" /> Products
                    </TabsTrigger>
                    {canViewRevenue && (
                        <TabsTrigger value="customers" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 h-10 transition-all gap-2">
                            <UsersIcon className="h-4 w-4" /> Customers
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="stock">
                    <StockDashboard filters={filters} />
                </TabsContent>
                {canViewRevenue && (
                    <TabsContent value="revenue">
                        <RevenueDashboard filters={filters} />
                    </TabsContent>
                )}
                <TabsContent value="products">
                    <ProductDashboard filters={filters} />
                </TabsContent>
                {canViewRevenue && (
                    <TabsContent value="customers">
                        <CustomerDashboard filters={filters} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
