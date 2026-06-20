"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Download, Eye, Calendar, User, Filter, Printer, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadCSV } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";

export default function InvoicesPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: invoices, isLoading } = useQuery({
        queryKey: ["invoices"],
        queryFn: async () => {
            const { data } = await api.get("/invoices");
            return data;
        },
    });

    const handleExport = () => {
        if (!invoices) return;
        const exportData = invoices.map((inv: any) => ({
            "Invoice ID": inv.id,
            "Customer": inv.customer?.name || "Walking Customer",
            "Date": format(new Date(inv.createdAt), "yyyy-MM-dd HH:mm"),
            "Total": inv.totalAmount,
            "Net": inv.netAmount,
            "Mode": inv.paymentMode,
            "Status": inv.paymentStatus
        }));
        downloadCSV(exportData, `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "PAID": return "default";
            case "PENDING":
            case "PARTIAL": return "secondary";
            case "CANCELLED": return "destructive";
            default: return "outline";
        }
    };

    const filteredInvoices = invoices?.filter((inv: any) => {
        const searchString = searchTerm.toLowerCase();
        return (
            inv.id.toLowerCase().includes(searchString) ||
            (inv.customer?.name || "walking customer").toLowerCase().includes(searchString)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Invoice History</h2>
                    <p className="text-muted-foreground">Manage and track all generated bills.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export All
                    </Button>
                    <Button className="h-10" onClick={() => window.location.href = '/billing'}>
                        <FileText className="mr-2 h-4 w-4" />
                        New Bill
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Invoice ID or Customer Name..."
                                className="pl-10 h-10 border-none bg-white dark:bg-slate-950 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[140px] border-none bg-white dark:bg-slate-950 shadow-sm h-10">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="h-10 px-3 bg-white dark:bg-slate-950 border-none shadow-sm">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="w-[120px] pl-6 font-bold text-[10px] uppercase tracking-widest">INV ID</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Customer</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Date & Time</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Total Amount</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Payment Mode</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary/20" />
                                </TableCell>
                            </TableRow>
                        ) : filteredInvoices?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">No invoices found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices?.map((invoice: any) => (
                                <TableRow key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 group">
                                    <TableCell className="font-mono font-bold text-primary pl-6">{invoice.id.substring(0, 8)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                {(invoice.customer?.name || "W")[0]}
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">{invoice.customer?.name || "Walking Customer"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Calendar className="h-3.5 w-3.5 opacity-50" />
                                            {format(new Date(invoice.createdAt), "yyyy-MM-dd HH:mm")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-900 dark:text-slate-50">₹{invoice.netAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono uppercase text-[9px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">{invoice.paymentMode}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(invoice.paymentStatus) as any} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                                            {invoice.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-white border-slate-200/50 shadow-sm">
                                                <Eye className="h-4 w-4 text-slate-600" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-primary/5 hover:text-primary hover:border-primary/20 border-slate-200/50 shadow-sm" onClick={handlePrint}>
                                                <Printer className="h-4 w-4" />
                                            </Button>
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
