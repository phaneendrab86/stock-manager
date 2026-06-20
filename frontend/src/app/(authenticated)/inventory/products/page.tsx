"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Search, Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { downloadCSV } from "@/lib/utils";

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            try {
                const { data } = await api.get("/products");
                return data as any[];
            } catch (e) {
                return [
                    { id: "1", name: "Coca Cola 500ml", category: { name: "Beverages" }, brandType: "BRANDED", sku: "COKE-500", stock: 45 },
                    { id: "2", name: "Pepsi 500ml", category: { name: "Beverages" }, brandType: "BRANDED", sku: "PEPSI-500", stock: 8 },
                    { id: "3", name: "Lay's Magic Masala", category: { name: "Snacks" }, brandType: "BRANDED", sku: "LAYS-MM", stock: 65 },
                    { id: "4", name: "Local Milk 1L", category: { name: "General Items" }, brandType: "LOCAL", sku: "MILK-1L", stock: 15 },
                ];
            }
        },
    });

    const handleExport = () => {
        if (!products) return;
        const exportData = products.map(p => ({
            "Product ID": p.id,
            "Name": p.name,
            "Category": p.category?.name || "N/A",
            "SKU": p.sku || "-",
            "Stock": p.stock,
            "Type": p.brandType
        }));
        downloadCSV(exportData, `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Inventory exported successfully!");
    };

    const filteredProducts = products?.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">Manage your product inventory and pricing.</p>
                </div>
                <Button asChild>
                    <Link href="/inventory/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-2 pt-0">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products by name or SKU..."
                                className="pl-10 h-11 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl focus-visible:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" className="h-11 px-4 bg-white dark:bg-slate-950 border-none shadow-sm rounded-xl" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4 text-slate-500" />
                                Export
                            </Button>
                            <Button variant="outline" className="h-11 px-4 bg-white dark:bg-slate-950 border-none shadow-sm rounded-xl flex-1 md:flex-none">
                                <Filter className="mr-2 h-4 w-4 text-slate-500" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest">Product Information</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Category</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Type</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">SKU Code</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Available Stock</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                        <p className="text-xs font-medium text-slate-400">Syncing inventory...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <Search className="h-10 w-10 opacity-10" />
                                        <p className="text-sm">No products matched your search.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts?.map((product: any) => (
                                <TableRow key={product.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="pl-6 py-4">
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</div>
                                        <div className="text-[10px] text-slate-400 font-mono tracking-wider">{product.id.substring(0, 8)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-medium text-[10px]">
                                            {product.category.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-tighter ${product.brandType === 'BRANDED' ? 'text-indigo-500 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30' : 'text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50/30'}`}>
                                            {product.brandType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-500 uppercase">{product.sku || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${product.stock <= 10 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                                            <span className={`font-bold ${product.stock <= 10 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                {product.stock}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-white border-slate-200/50 shadow-sm" asChild>
                                                <Link href={`/inventory/products/${product.id}`}>
                                                    <Pencil className="h-4 w-4 text-slate-600" />
                                                </Link>
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
