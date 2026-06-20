"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Search, Info, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function UnitsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", conversion: 1 });
    const [searchQuery, setSearchQuery] = useState("");

    const queryClient = useQueryClient();

    const { data: units, isLoading } = useQuery({
        queryKey: ["units"],
        queryFn: async () => {
            try {
                const { data } = await api.get("/units");
                return data as any[];
            } catch (e) {
                return [
                    { id: "1", name: "Piece", conversion: 1 },
                    { id: "2", name: "Box (10pcs)", conversion: 10 },
                    { id: "3", name: "Case (50pcs)", conversion: 50 },
                ];
            }
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post("/units", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["units"] });
            toast.success("Unit created successfully");
            closeDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create unit");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/units/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["units"] });
            toast.success("Unit updated successfully");
            closeDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update unit");
        },
    });

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingUnit(null);
        setFormData({ name: "", conversion: 1 });
    };

    const handleEdit = (unit: any) => {
        setEditingUnit(unit);
        setFormData({ name: unit.name, conversion: unit.conversion });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUnit) {
            updateMutation.mutate({ id: editingUnit.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredUnits = units?.filter((u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Units of Measure</h2>
                    <p className="text-muted-foreground text-sm">Define measurement scales and base quantity factors.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingUnit(null)} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" />
                            Define New Unit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
                        <form onSubmit={handleSubmit}>
                            <div className="p-8">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">{editingUnit ? "Adjust scale" : "Establish scale"}</DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                        Configure how this unit relates to individual pieces.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Unit Descriptor</label>
                                        <Input
                                            placeholder="e.g. Box (12pcs), Case..."
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Scale Factor</label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="rounded-lg bg-slate-900 text-[10px] p-2 border-none">
                                                        Quantity of base units (e.g. pieces) within this defined container.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div className="relative">
                                            <Scale className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-300 pointer-events-none" />
                                            <Input
                                                type="number"
                                                min="1"
                                                className="h-12 pl-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20 font-bold text-lg"
                                                value={formData.conversion}
                                                onChange={(e) => setFormData({ ...formData, conversion: parseInt(e.target.value) || 1 })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 px-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <Button type="button" variant="ghost" className="rounded-xl h-11 px-6 font-semibold" onClick={closeDialog}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="rounded-xl h-11 px-8 font-semibold shadow-lg shadow-primary/20" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingUnit ? "Update Definition" : "Save Definition"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find measurement units..."
                            className="pl-10 h-10 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest">Unit Name</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Scale Ratio</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-20" />
                                </TableCell>
                            </TableRow>
                        ) : filteredUnits?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <Scale className="h-10 w-10 opacity-10" />
                                        <p className="text-sm">No defined units found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUnits?.map((unit: any) => (
                                <TableRow key={unit.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="pl-6 py-4 font-bold text-slate-900 dark:text-slate-100">{unit.name}</TableCell>
                                    <TableCell>
                                        <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-bold text-xs">
                                            ×{unit.conversion}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-white border-slate-200/50 shadow-sm" onClick={() => handleEdit(unit)}>
                                                <Pencil className="h-4 w-4 text-slate-600" />
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
