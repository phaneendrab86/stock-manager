"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Search, Building2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DistributorForm } from "@/components/distributor-form";

export default function DistributorsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDistributor, setEditingDistributor] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: distributors, isLoading } = useQuery({
        queryKey: ["distributors"],
        queryFn: async () => {
            const { data } = await api.get("/distributors");
            return data as any[];
        },
    });

    const filteredDistributors = distributors?.filter((d: any) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (distributor: any) => {
        setEditingDistributor(distributor);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingDistributor(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 italic">Distributors</h2>
                    <p className="text-muted-foreground">Manage your suppliers and their outstanding balances.</p>
                </div>
                <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-300 transform hover:scale-[1.02]">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Distributor
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search distributors by name or contact person..."
                            className="pl-10 h-11 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl focus-visible:ring-indigo-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="border-b border-slate-100 dark:border-slate-800">
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4">Distributor Information</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4">Contact Details</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Outstanding Bal.</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 font-medium text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-10 w-10 animate-spin text-indigo-400 opacity-20" />
                                        <p className="text-xs uppercase tracking-widest font-bold">Fetching Suppliers...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredDistributors?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <Building2 className="h-12 w-12 opacity-5" />
                                        <p className="text-sm font-medium">No distributors found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDistributors?.map((distributor: any) => (
                                <TableRow key={distributor.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <TableCell className="pl-6 py-5">
                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight tracking-tight">{distributor.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter text-indigo-500 border-indigo-200 bg-indigo-50/30">
                                                {distributor.gstNumber || "No GST"}
                                            </Badge>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                {distributor.products?.length || 0} Products • {distributor.salesmen?.length || 0} Salesmen
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 group/item">
                                                <Phone className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-indigo-500 transition-colors" />
                                                <span className="font-medium">{distributor.phone || "---"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 group/item">
                                                <Mail className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-indigo-500 transition-colors" />
                                                <span className="font-medium underline decoration-slate-200 underline-offset-4">{distributor.contactPerson || "N/A"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-lg font-black tracking-tighter ${distributor.outstandingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                                ₹{distributor.outstandingBalance?.toLocaleString() || 0}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2 transition-all">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 group/btn" onClick={() => handleEdit(distributor)}>
                                                <Pencil className="h-4.5 w-4.5 text-slate-400 group-hover/btn:text-indigo-600 transition-colors" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-3xl border-none shadow-2xl bg-white dark:bg-slate-950 rounded-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                            {editingDistributor ? "Update Distributor" : "Add New Supplier"}
                        </DialogTitle>
                        <p className="text-slate-500 text-sm font-medium">
                            {editingDistributor ? "Modify distributor details, salesmen, and product catalog." : "Create a new central hub for your supplier management."}
                        </p>
                    </DialogHeader>
                    <div className="px-8 pb-8">
                        <DistributorForm
                            initialData={editingDistributor}
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                queryClient.invalidateQueries({ queryKey: ["distributors"] });
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
