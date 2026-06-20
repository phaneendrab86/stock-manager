"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Loader2, ArrowLeft, TrendingUp, TrendingDown, Landmark, PieChart } from "lucide-react";

import Link from "next/link";

export default function ProfitLossReportPage() {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const { data: summary, isLoading } = useQuery({
        queryKey: ["reports", "summary", startDate, endDate],
        queryFn: async () => (await api.get(`/reports/summary?startDate=${startDate}&endDate=${endDate}`)).data,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profit & Loss Summary</h2>
                    <p className="text-muted-foreground text-sm">A consolidated view of your business revenue and expenditures.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-1.5 flex-1">
                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Period Start</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-primary opacity-50" />
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-10 h-10 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5 flex-1">
                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Period End</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-primary opacity-50" />
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-10 h-10 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                    <p className="text-xs font-medium animate-pulse">Calculating financials...</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-none shadow-md ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Gross Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-slate-900 dark:text-slate-50">₹{summary?.totalRevenue.toLocaleString()}</div>
                            <div className="mt-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                <TrendingUp className="h-4 w-4" />
                                <span>Total Inflow</span>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 h-full w-1 bg-emerald-500 transition-all group-hover:w-2"></div>
                    </Card>

                    <Card className="border-none shadow-md ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-rose-600 dark:text-rose-400">₹{summary?.totalExpenses.toLocaleString()}</div>
                            <div className="mt-3 flex items-center gap-2 text-rose-600/70 text-xs font-bold">
                                <TrendingDown className="h-4 w-4" />
                                <span>Total Outflow</span>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 h-full w-1 bg-rose-500 transition-all group-hover:w-2"></div>
                    </Card>

                    <Card className={`border-none shadow-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 overflow-hidden relative ${summary?.netProfit >= 0 ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : 'bg-rose-900 text-white'}`}>
                        <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">Net Profit / Loss</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black">₹{summary?.netProfit.toLocaleString()}</div>
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold opacity-80">
                                <Landmark className="h-4 w-4" />
                                <span>{summary?.margin.toFixed(1)}% Profit Margin</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3 border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-primary" />
                                Financial Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 flex items-center justify-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 text-slate-400 italic text-sm">
                            Numerical analysis suggests a {summary?.margin >= 10 ? 'healthy' : 'tight'} margin for this period.
                            Consider optimizing {summary?.totalExpenses > summary?.totalRevenue * 0.5 ? 'operating costs' : 'sales volume'} to improve net earnings.
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
