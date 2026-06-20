"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    PieChart,
    TrendingUp,
    Package,
    AlertTriangle,
    Clock,
    Database,
    Store,
    UserCircle,
    ArrowUpRight,
    Users,
    Truck,
    Box,
    Plus,
    History,
    MoreHorizontal
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState("sells");

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: dashboardData } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const { data } = await api.get("/analytics/dashboard");
            return data;
        },
    });

    const { data: recentActivities, isLoading: isRecentLoading } = useQuery({
        queryKey: ["recent-activities", activeTab],
        queryFn: async () => {
            const { data } = await api.get(`/analytics/recent/${activeTab}`);
            return data;
        },
    });

    const actionIcons = [
        { label: "POS", icon: ShoppingCart, url: "/billing", color: "text-blue-500" },
        { label: "Invoice", icon: FileText, url: "/billing/history", color: "text-slate-500" },
        { label: "Overview Report", icon: PieChart, url: "/reports", color: "text-purple-500" },
        { label: "Sell Report", icon: TrendingUp, url: "/reports/sales", color: "text-emerald-500" },
        { label: "Purchase Report", icon: Truck, url: "/reports/purchases", color: "text-sky-500" },
        { label: "Stock Alert", icon: AlertTriangle, url: "/inventory/history", color: "text-orange-500" },
        { label: "Expired", icon: AlertTriangle, url: "/inventory/history", color: "text-rose-500" },
        { label: "Backup/Restore", icon: Database, url: "/settings/system", color: "text-blue-600" },
        { label: "Stores", icon: Store, url: "/settings/system", color: "text-amber-600" },
    ];

    const stats = [
        {
            label: "TOTAL INVOICE",
            value: dashboardData?.totalInvoices || "0",
            subLabel: "TOTAL INVOICE TODAY",
            subValue: dashboardData?.todayInvoices || "0",
            color: "bg-emerald-600",
            icon: FileText
        },
        {
            label: "TOTAL CUSTOMER",
            value: dashboardData?.totalCustomers || "0",
            subLabel: "TOTAL CUSTOMER TODAY",
            subValue: dashboardData?.todayCustomers || "0",
            color: "bg-rose-500",
            icon: Users
        },
        {
            label: "TOTAL SUPPLIER",
            value: dashboardData?.totalSuppliers || "0",
            subLabel: "TOTAL SUPPLIER TODAY",
            subValue: dashboardData?.todaySuppliers || "0",
            color: "bg-indigo-600",
            icon: Truck
        },
        {
            label: "TOTAL PRODUCT",
            value: dashboardData?.totalProducts || "0",
            subLabel: "TOTAL PRODUCT TODAY",
            subValue: dashboardData?.todayProducts || "0",
            color: "bg-amber-500",
            icon: Box
        },
    ];

    return (
        <div className="space-y-6 pb-10 bg-slate-50 min-h-screen -m-6 p-6 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center text-zinc-900">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    Dashboard <span className="text-sm font-medium text-slate-400">Store 01</span>
                </h1>
                <div className="text-sm text-slate-500 flex items-center gap-2 italic">
                    <Clock className="h-4 w-4" />
                    {format(currentTime, "yyyy-MM-dd HH:mm:ss")}
                </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 justify-space-between">
                {actionIcons.map((item, i) => (
                    <Link key={i} href={item.url} className="flex-shrink-0">
                        <div className="w-29 h-24 bg-white border border-slate-200 rounded-sm flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow group">
                            <item.icon className={`h-8 w-8 ${item.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase text-center px-1 whitespace-nowrap">{item.label}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (stat.label && (
                    <div key={i} className={`${stat.color} p-6 text-white rounded-none relative overflow-hidden group`}>
                        <stat.icon className="absolute right-[-10px] top-[-10px] h-32 w-32 opacity-20 group-hover:scale-110 transition-transform" />
                        <div className="relative z-1 space-y-4">
                            <div className="space-y-1">
                                <div className="text-xs font-bold uppercase tracking-widest opacity-80">{stat.label}</div>
                                <div className="text-4xl font-bold tabular-nums tracking-tighter">{stat.value}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">{stat.subLabel}</div>
                                <div className="text-xl font-bold tabular-nums tracking-tighter">{stat.subValue}</div>
                            </div>
                            <div className="pt-2 flex justify-center border-t border-white/20">
                                <button className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline">
                                    Details <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )))}
            </div>

            {/* Recent Activities Section */}
            <Card className="border-none shadow-sm rounded-none overflow-hidden">
                <CardHeader className="bg-white border-b py-4">
                    <h2 className="text-lg font-bold text-slate-800">Recent Activities</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row divide-x divide-slate-100">
                        {/* Left: Interactive Table */}
                        <div className="flex-1">
                            <div className="flex bg-slate-50 border-b overflow-x-auto">
                                {["Sells", "Purchases", "Customers", "Suppliers"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === tab.toLowerCase()
                                            ? "border-blue-600 text-blue-600 bg-white"
                                            : "border-transparent text-slate-400 hover:text-slate-600"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="p-6">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="hover:bg-transparent">
                                            {activeTab === 'sells' ? (
                                                <>
                                                    <TableHead className="font-bold text-xs">Invoice Id</TableHead>
                                                    <TableHead className="font-bold text-xs">Created At</TableHead>
                                                    <TableHead className="font-bold text-xs">Customer Name</TableHead>
                                                    <TableHead className="font-bold text-xs">Amount</TableHead>
                                                    <TableHead className="font-bold text-xs text-center">Payment Status</TableHead>
                                                </>
                                            ) : (
                                                <>
                                                    <TableHead className="font-bold text-xs">ID</TableHead>
                                                    <TableHead className="font-bold text-xs">Name / Title</TableHead>
                                                    <TableHead className="font-bold text-xs">Created At</TableHead>
                                                    <TableHead className="font-bold text-xs">Details</TableHead>
                                                </>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isRecentLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                                            </TableRow>
                                        ) : (
                                            recentActivities?.map((row: any, i: number) => (
                                                <TableRow key={i} className="text-slate-600 text-sm">
                                                    {activeTab === 'sells' ? (
                                                        <>
                                                            <TableCell className="font-mono text-xs text-blue-600 font-bold">{row.id.substring(0, 8)}</TableCell>
                                                            <TableCell>{format(new Date(row.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                                                            <TableCell className="font-medium">{row.customer?.name || "Walking Customer"}</TableCell>
                                                            <TableCell className="font-black">₹{row.netAmount.toFixed(2)}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge className={`${row.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full text-[10px] w-20 justify-center h-5 uppercase tracking-widest`}>
                                                                    {row.paymentStatus}
                                                                </Badge>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell className="font-mono text-xs">{row.id.substring(0, 8)}</TableCell>
                                                            <TableCell className="font-medium">{row.name || row.title || "Unknown"}</TableCell>
                                                            <TableCell>{format(new Date(row.createdAt), "yyyy-MM-dd")}</TableCell>
                                                            <TableCell>{row.distributor?.name || row.type || "N/A"}</TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                                <div className="mt-8 flex gap-3">
                                    <Button size="sm" className="bg-sky-500 hover:bg-sky-600 rounded-none h-9 font-bold px-4 flex items-center gap-2">
                                        <Plus className="h-4 w-4" /> ADD SELL
                                    </Button>
                                    <Button size="sm" variant="secondary" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none h-9 font-bold px-4 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" /> SELL LIST
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary Sidebar */}
                        <div className="w-full lg:w-96 p-8 space-y-8 bg-slate-50/50">
                            {[
                                { label: "Sell Amount", val: "1,100.00", color: "bg-sky-400", percent: 85 },
                                { label: "Discount Given", val: "0.00", color: "bg-orange-400", percent: 0 },
                                { label: "Due Given", val: "400.00", color: "bg-rose-500", percent: 35 },
                                { label: "Received Amount", val: "700.00", color: "bg-emerald-600", percent: 65 },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm font-bold text-slate-800">{item.label}</span>
                                        <span className="text-sm font-black text-slate-500 tabular-nums">{item.val}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 overflow-hidden">
                                        <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.percent}%` }} />
                                    </div>
                                </div>
                            ))}
                            <Link href="/reports" className="block w-full">
                                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-none font-bold italic py-6 flex items-center justify-center gap-2">
                                    Overview Report <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
