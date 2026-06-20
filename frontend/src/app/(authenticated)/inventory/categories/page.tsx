"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [categoryName, setCategoryName] = useState("");
    const [isTobacco, setIsTobacco] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const { data } = await api.get("/categories");
                return data as any[];
            } catch (e) {
                return [
                    { id: "1", name: "Beverages", isTobacco: false, _count: { products: 12 } },
                    { id: "2", name: "Beverages (Bulk)", isTobacco: false, _count: { products: 5 } },
                    { id: "3", name: "Snacks", isTobacco: false, _count: { products: 24 } },
                    { id: "4", name: "General Items", isTobacco: false, _count: { products: 8 } },
                ];
            }
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: { name: string; isTobacco: boolean }) => api.post("/categories", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category created successfully");
            closeDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create category");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }: { id: string; name: string; isTobacco: boolean }) => api.patch(`/categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category updated successfully");
            closeDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update category");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete category");
        },
    });

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setCategoryName("");
        setIsTobacco(false);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setIsTobacco(category.isTobacco || false);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, name: categoryName, isTobacco });
        } else {
            createMutation.mutate({ name: categoryName, isTobacco });
        }
    };

    const filteredCategories = categories?.filter((c: any) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                    <p className="text-muted-foreground">Manage your product categories here.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingCategory(null)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                        <form onSubmit={handleSubmit}>
                            <div className="p-8">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                        Organize your products with descriptive category names.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Category Name</label>
                                        <Input
                                            placeholder="e.g. Beverages, Snacks..."
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                            value={categoryName}
                                            onChange={(e) => setCategoryName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <div className="flex h-6 items-center">
                                            <input
                                                id="isTobacco"
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                checked={isTobacco}
                                                onChange={(e) => setIsTobacco(e.target.checked)}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm leading-6">
                                            <label htmlFor="isTobacco" className="font-semibold text-slate-900 dark:text-slate-100">
                                                Is Tobacco Category
                                            </label>
                                            <p className="text-muted-foreground text-[10px]">Products in this category will be excluded from coupon discounts.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <Button type="button" variant="ghost" className="rounded-xl h-11 px-6 font-semibold" onClick={closeDialog}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="rounded-xl h-11 px-8 font-semibold shadow-lg shadow-primary/20" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingCategory ? "Update Category" : "Save Category"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <Card className="flex-1 border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                    <CardContent className="p-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-10 h-10 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest">Category Detail</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Products Linked</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                        <p className="text-xs font-medium text-slate-400">Loading categories...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredCategories?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <Search className="h-10 w-10 opacity-10" />
                                        <p className="text-sm">No categories found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCategories?.map((category: any) => (
                                <TableRow key={category.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="pl-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{category.name}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none px-3 font-bold">
                                            {category._count.products} products
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-white border-slate-200/50 shadow-sm" onClick={() => handleEdit(category)}>
                                                <Pencil className="h-4 w-4 text-slate-600" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 border-slate-200/50 shadow-sm"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this category?")) {
                                                        deleteMutation.mutate(category.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
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
