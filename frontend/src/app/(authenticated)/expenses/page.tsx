"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Receipt, Wallet, Filter, Loader2, Calendar, Check, X, Tag, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ExpensesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const { data: expenses, isLoading, refetch } = useQuery({
        queryKey: ["expenses"],
        queryFn: async () => {
            const { data } = await api.get("/expenses");
            return data;
        }
    });

    const { data: categories } = useQuery({
        queryKey: ["expense-categories"],
        queryFn: async () => {
            const { data } = await api.get("/expenses/categories");
            return data;
        }
    });

    const [newExpense, setNewExpense] = useState({
        title: "",
        categoryId: "",
        amount: "",
        paymentMode: "CASH"
    });

    const handleCreateExpense = async () => {
        try {
            await api.post("/expenses", {
                ...newExpense,
                amount: parseFloat(newExpense.amount)
            });
            toast.success("Expense recorded successfully!");
            setIsAddOpen(false);
            setNewExpense({ title: "", categoryId: "", amount: "", paymentMode: "CASH" });
            refetch();
        } catch (e) {
            toast.error("Failed to record expense");
        }
    };

    const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/expenses/${id}/${status.toLowerCase()}`, { note: "Updated from UI" });
            toast.success(`Expense ${status.toLowerCase()} successfully`);
            refetch();
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const stats = {
        total: expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0,
        approved: expenses?.filter((exp: any) => exp.status === 'APPROVED').reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0,
        pending: expenses?.filter((exp: any) => exp.status === 'PENDING').reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
            case "PENDING":
                return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 italic">Pending</Badge>;
            default:
                return <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-600">Rejected</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Outflow</h2>
                    <p className="text-muted-foreground">Track and approve operational expenses.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsCategoryOpen(true)}>
                        <Tag className="mr-2 h-4 w-4" />
                        Categories
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Record Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>New Expense Record</DialogTitle>
                                <DialogDescription>Enter details of the spent amount for tracking.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Title / Decription</label>
                                    <Input
                                        placeholder="e.g. Office Rent, Furniture Repair"
                                        value={newExpense.title}
                                        onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <Select
                                            value={newExpense.categoryId}
                                            onValueChange={(val) => setNewExpense({ ...newExpense, categoryId: val })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                {categories?.map((cat: any) => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Amount (₹)</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={newExpense.amount}
                                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Payment Mode</label>
                                    <Select
                                        value={newExpense.paymentMode}
                                        onValueChange={(val) => setNewExpense({ ...newExpense, paymentMode: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="BANK">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateExpense}>Save Record</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-primary/5 ring-1 ring-primary/10">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Spend</CardTitle>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Wallet className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">₹{stats.total.toLocaleString()}</div>
                    </CardHeader>
                </Card>
                <Card className="border-none shadow-sm bg-emerald-500/5 ring-1 ring-emerald-500/10">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Approved</CardTitle>
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Check className="h-4 w-4 text-emerald-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-emerald-600">₹{stats.approved.toLocaleString()}</div>
                    </CardHeader>
                </Card>
                <Card className="border-none shadow-sm bg-amber-500/5 ring-1 ring-amber-500/10">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Waiting</CardTitle>
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Calendar className="h-4 w-4 text-amber-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-amber-600">₹{stats.pending.toLocaleString()}</div>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-none shadow-md overflow-hidden bg-slate-50/30 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50">
                <div className="p-4 border-b bg-card">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find an expense..."
                            className="pl-9 bg-slate-100/50 dark:bg-slate-800/50 border-none h-10 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="pl-6">Record Details</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead className="text-right pr-6">Workflow</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-20" />
                                </TableCell>
                            </TableRow>
                        ) : expenses?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">No expenses recorded yet.</TableCell>
                            </TableRow>
                        ) : (
                            expenses?.filter((exp: any) => exp.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((expense: any) => (
                                    <TableRow key={expense.id} className="group hover:bg-slate-100/30 dark:hover:bg-slate-800/30">
                                        <TableCell className="pl-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{expense.title}</div>
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(expense.createdAt), "MMM d, yyyy • hh:mm a")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                                                {expense.category?.name || "Uncategorized"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-primary">₹{expense.amount.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                                                    {(expense.createdBy?.name || "S")[0]}
                                                </div>
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{expense.createdBy?.name || "Staff"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {expense.status === 'PENDING' ? (
                                                <div className="flex justify-end gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200/50 shadow-sm"
                                                        onClick={() => handleStatusUpdate(expense.id, 'APPROVED')}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200/50 shadow-sm"
                                                        onClick={() => handleStatusUpdate(expense.id, 'REJECTED')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Receipt</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Category Management Dialog */}
            <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Expense Categories</DialogTitle>
                        <DialogDescription>Manage types of operational spending.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="flex gap-2">
                            <Input placeholder="New category name..." />
                            <Button size="icon"><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="border rounded-lg divide-y bg-zinc-50 dark:bg-zinc-900/50">
                            {categories?.map((cat: any) => (
                                <div key={cat.id} className="p-3 text-sm flex justify-between items-center group">
                                    <span>{cat.name}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100">
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
