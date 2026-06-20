"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Calendar, Loader2, ArrowLeft, WalletCards, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { downloadCSV } from "@/lib/utils";
import Link from "next/link";

export default function ExpenseReportPage() {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: expenses = [], isLoading } = useQuery({
        queryKey: ["reports", "expenses", startDate, endDate],
        queryFn: async () => (await api.get(`/reports/expenses?startDate=${startDate}&endDate=${endDate}`)).data,
    });

    const handleExport = () => {
        const exportData = expenses.map((exp: any) => ({
            "Title": exp.title,
            "Date": new Date(exp.date).toLocaleDateString(),
            "Category": exp.category?.name || "Uncategorized",
            "Amount": exp.amount,
            "Status": exp.status,
            "Mode": exp.paymentMode
        }));
        downloadCSV(exportData, `expense_report_${startDate}_to_${endDate}.csv`);
    };

    const filteredExpenses = expenses.filter((e: any) =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.category?.name && e.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalExpenses = filteredExpenses.reduce((acc: number, e: any) => acc + e.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Expense Report</h2>
                    <p className="text-muted-foreground text-sm">Detailed tracking of operational costs and categorical spending.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Start Date</label>
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
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">End Date</label>
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
                        <Button className="h-10 rounded-xl bg-primary shadow-lg shadow-primary/20 px-6" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-rose-600 text-white overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Period Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full">
                            <TrendingDown className="h-3 w-3" />
                            <span>{filteredExpenses.length} Expense Items</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by Title or Category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-9 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
                        <TableRow>
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest h-10">Expense Title</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Date</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Category</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Amount</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Mode</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest h-10">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <p className="text-xs font-medium">Fetching expense data...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                    No expenses recorded for this period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExpenses.map((expense: any) => (
                                <TableRow key={expense.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="pl-6 font-bold text-slate-900 dark:text-slate-100 italic">
                                        {expense.title}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                            {expense.category?.name || "Uncategorized"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-rose-600 dark:text-rose-400">
                                        ₹{expense.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[9px] uppercase font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-0">
                                            {expense.paymentMode}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={expense.status === 'APPROVED' ? 'default' : 'secondary'} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0">
                                            {expense.status}
                                        </Badge>
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
