"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, ClipboardList, Plus, Search, Filter, History } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { VisitStatus } from "@/shared/types";

export default function VisitsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDistributorId, setSelectedDistributorId] = useState("");

    // Queries
    const { data: visits } = useQuery({
        queryKey: ["visits"],
        queryFn: async () => (await api.get("/visits")).data,
    });

    const { data: distributors } = useQuery({
        queryKey: ["distributors"],
        queryFn: async () => (await api.get("/distributors")).data,
    });

    const { data: salesmen } = useQuery({
        queryKey: ["salesmen", selectedDistributorId],
        queryFn: async () => {
            const url = selectedDistributorId ? `/salesmen?distributorId=${selectedDistributorId}` : "/salesmen";
            return (await api.get(url)).data;
        },
    });

    // Mutations
    const createVisit = useMutation({
        mutationFn: async (data: any) => (await api.post("/visits", data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visits"] });
            toast.success("Visit recorded successfully");
            setIsDialogOpen(false);
            setSelectedDistributorId("");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to record visit")
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        // Handle boolean
        data.orderPlaced = data.orderPlaced === "on";

        createVisit.mutate(data);
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight italic text-slate-900">Distributor Visits</h1>
                    <p className="text-muted-foreground">Monitor supplier visits, product discussions, and follow-ups.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Record New Visit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-widest text-slate-900 border-b pb-4 mb-2">Record Visit</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Distributor</Label>
                                    <Select
                                        name="distributorId"
                                        required
                                        onValueChange={setSelectedDistributorId}
                                    >
                                        <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                            <SelectValue placeholder="Select Supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {distributors?.map((d: any) => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Salesman</Label>
                                    <Select name="salesmanId" required disabled={!selectedDistributorId}>
                                        <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                            <SelectValue placeholder="Select Salesman" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {salesmen?.map((s: any) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="purpose">Purpose of Visit</Label>
                                <Input id="purpose" name="purpose" required placeholder="e.g. New product launch, collection" className="rounded-xl h-11 border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="productsDiscussed">Products Discussed</Label>
                                <Input id="productsDiscussed" name="productsDiscussed" placeholder="Optional" className="rounded-xl h-11 border-slate-200" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</Label>
                                    <Select name="status" defaultValue={VisitStatus.COMPLETED}>
                                        <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={VisitStatus.COMPLETED}>Completed</SelectItem>
                                            <SelectItem value={VisitStatus.FOLLOW_UP_REQUIRED}>Follow-up Required</SelectItem>
                                            <SelectItem value={VisitStatus.ORDER_CONFIRMED}>Order Confirmed</SelectItem>
                                            <SelectItem value={VisitStatus.PAYMENT_PENDING}>Payment Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="followUpDate">Follow-up Date</Label>
                                    <Input id="followUpDate" name="followUpDate" type="date" className="rounded-xl h-11 border-slate-200" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="notes">Internal Notes</Label>
                                <Input id="notes" name="notes" placeholder="Optional" className="rounded-xl h-11 border-slate-200" />
                            </div>
                            <DialogFooter className="pt-4 border-t border-slate-100 mt-4">
                                <Button type="submit" disabled={createVisit.isPending} className="w-full bg-slate-900 h-12 rounded-xl font-bold uppercase tracking-widest text-xs">
                                    {createVisit.isPending ? "Recording..." : "Save Visit Record"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Visit History</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by supplier or salesman..."
                                    className="pl-8 h-9 rounded-lg border-slate-200 shadow-none focus-visible:ring-indigo-500/10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-b border-slate-100 last:border-0 hover:bg-transparent">
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-12">Date</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-12">Distributor</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-12">Salesman</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-12">Purpose</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-12">Status</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-12">Follow-up</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest text-slate-400 h-12">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visits?.filter((v: any) =>
                                v.distributor.name.toLowerCase().includes(search.toLowerCase()) ||
                                v.salesman.name.toLowerCase().includes(search.toLowerCase())
                            ).map((visit: any) => (
                                <TableRow key={visit.id} className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/30">
                                    <TableCell className="font-medium h-16">
                                        {format(new Date(visit.visitDate), "PPP")}
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-900">{visit.distributor.name}</TableCell>
                                    <TableCell className="font-medium text-slate-600 underline decoration-slate-200 underline-offset-4">{visit.salesman.name}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{visit.purpose}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            visit.status === 'COMPLETED' ? 'default' :
                                                visit.status === 'FOLLOW_UP_REQUIRED' ? 'secondary' : 'outline'
                                        } className="rounded-lg h-6 px-2.5 text-[9px] font-black tracking-widest uppercase">
                                            {visit.status.replace(/_/g, " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-400 font-bold text-[10px]">
                                        {visit.followUpDate ? format(new Date(visit.followUpDate), "PP") : "---"}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
