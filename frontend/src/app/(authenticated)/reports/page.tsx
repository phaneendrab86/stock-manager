"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    FileText,
    BarChart3,
    ShoppingCart,
    WalletCards,
    ArrowRight,
    PieChart,
    Clock,
    TrendingDown
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const reportCards = [
    {
        title: "Sales Reports",
        description: "Detailed breakdown of invoices, daily totals, and payment modes.",
        icon: ShoppingCart,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/20",
        border: "border-blue-100 dark:border-blue-900/50",
        link: "/reports/sales"
    },
    {
        title: "Inventory Reports",
        description: "Current stock status, low stock alerts, and valuation.",
        icon: BarChart3,
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        border: "border-emerald-100 dark:border-emerald-900/50",
        link: "/reports/inventory"
    },
    {
        title: "Expense Reports",
        description: "Analysis of business spending by category and status.",
        icon: WalletCards,
        color: "text-rose-500",
        bg: "bg-rose-50 dark:bg-rose-950/20",
        border: "border-rose-100 dark:border-rose-900/50",
        link: "/reports/expenses"
    },
    {
        title: "Profit & Loss",
        description: "Summary of revenue vs expenses for a selected period.",
        icon: PieChart,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-950/20",
        border: "border-purple-100 dark:border-purple-900/50",
        link: "/reports/profit-loss"
    }
];

export default function ReportsDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Business Reports</h2>
                <p className="text-muted-foreground text-sm">Access detailed data and exportable files for your business operations.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {reportCards.map((report) => (
                    <Card key={report.title} className="group relative overflow-hidden border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className={`h-12 w-12 rounded-2xl ${report.bg} ${report.border} border flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <report.icon className={`h-6 w-6 ${report.color}`} />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">{report.title}</CardTitle>
                                <CardDescription className="text-sm">{report.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Button asChild variant="ghost" className="w-full justify-between items-center group/btn hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-12">
                                <Link href={report.link} className="flex w-full items-center justify-between">
                                    <span className="text-sm font-semibold">Generate Report</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        Recent Reports
                    </CardTitle>
                    <CardDescription>Quick access to your most recently accessed or generated reports.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <FileText className="h-12 w-12 opacity-10 mb-2" />
                    <p className="text-sm italic">No recent activity found.</p>
                </CardContent>
            </Card>
        </div>
    );
}
