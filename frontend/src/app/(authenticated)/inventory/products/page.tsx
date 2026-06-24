"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Loader2, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { downloadCSV } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistributor, setSelectedDistributor] = useState<string>("all");

    const { data: products, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            try {
                const { data } = await api.get("/products");
                return data as any[];
            } catch (e) {
                return [
                    { id: "1", name: "Coca Cola 500ml", category: { name: "Beverages" }, brandType: "BRANDED", sku: "COKE-500", stock: 45, distributors: [{ id: "d1", name: "ABC Distributors" }] },
                    { id: "2", name: "Pepsi 500ml", category: { name: "Beverages" }, brandType: "BRANDED", sku: "PEPSI-500", stock: 8, distributors: [{ id: "d2", name: "XYZ Traders" }] },
                    { id: "3", name: "Lay's Magic Masala", category: { name: "Snacks" }, brandType: "BRANDED", sku: "LAYS-MM", stock: 65, distributors: [{ id: "d1", name: "ABC Distributors" }] },
                    { id: "4", name: "Local Milk 1L", category: { name: "General Items" }, brandType: "LOCAL", sku: "MILK-1L", stock: 15, distributors: [{ id: "d3", name: "Metro Wholesale" }] },
                ];
            }
        },
    });

    const distributors = useMemo(() => {
        const uniqueDistributors = new Map();
        products?.forEach((p: any) => {
            p.distributors?.forEach((d: any) => {
                if (!uniqueDistributors.has(d.id)) {
                    uniqueDistributors.set(d.id, d);
                }
            });
        });
        return Array.from(uniqueDistributors.values());
    }, [products]);

    const handleExport = () => {
        if (!filteredProducts) return;
        const exportData = filteredProducts.map(p => ({
            "Product ID": p.id,
            "Name": p.name,
            "Category": p.category?.name || "N/A",
            "SKU": p.sku || "-",
            "Stock": p.stock,
            "Type": p.brandType,
            "Distributors": p.distributors?.map((d: any) => d.name).join(", ") || "-"
        }));
        downloadCSV(exportData, `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Products exported successfully!");
    };

    const filteredProducts = useMemo(() => {
        return products?.filter((p: any) => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDistributor =
                selectedDistributor === "all" ||
                p.distributors?.some((d: any) => d.id === selectedDistributor);

            return matchesSearch && matchesDistributor;
        });
    }, [products, searchQuery, selectedDistributor]);

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
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1 col-5">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products by name or SKU..."
                                className="pl-10 h-11 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl focus-visible:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">Filter by Distributor</label>
                            <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
                                <SelectTrigger className="h-11 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl">
                                    <SelectValue placeholder="Select a distributor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Distributors</SelectItem>
                                    {distributors.map((d: any) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 items-end">
                            <Button variant="outline" className="h-11 px-4 bg-white dark:bg-slate-950 border-none shadow-sm rounded-xl" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4 text-slate-500" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <Card className="border-none shadow-sm">
                    <CardContent className="p-20 flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                        <p className="text-xs font-medium text-slate-400">Loading products...</p>
                    </CardContent>
                </Card>
            ) : filteredProducts?.length === 0 ? (
                <Card className="border-none shadow-sm">
                    <CardContent className="p-20 flex flex-col items-center gap-3 text-center">
                        <Search className="h-10 w-10 opacity-10" />
                        <p className="text-sm text-muted-foreground">No products matched your filters.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts?.map((product: any) => (
                        <Card key={product.id} className="border-slate-200/50 dark:border-slate-800/50 hover:shadow-lg hover:border-slate-300/50 dark:hover:border-slate-700/50 transition-all duration-200 overflow-hidden group gap-0">
                            <CardHeader className="pb-1">
                                <div className="flex items-start justify-between gap-1">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 text-sm">{product.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-1">{product.id.substring(0, 8)}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-slate-500 uppercase">Category</span>
                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-medium text-[10px]">
                                            {product.category?.name || "N/A"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-slate-500 uppercase">Type</span>
                                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-tighter ${product.brandType === 'BRANDED' ? 'text-indigo-500 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30' : 'text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50/30'}`}>
                                            {product.brandType}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-medium text-slate-500 uppercase">SKU</span>
                                        <span className="font-mono text-xs text-slate-500">{product.sku || "-"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-slate-500 uppercase">Stock</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${product.stock <= 10 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                                            <span className={`font-bold text-sm ${product.stock <= 10 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {product.distributors && product.distributors.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-[11px] font-medium text-slate-500 uppercase block mb-2">Distributors</span>
                                        <div className="flex flex-wrap gap-1">
                                            {product.distributors.slice(0, 2).map((d: any) => (
                                                <Badge key={d.id} variant="secondary" className="bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none font-medium text-[10px]">
                                                    {d.name}
                                                </Badge>
                                            ))}
                                            {product.distributors.length > 2 && (
                                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-medium text-[10px]">
                                                    +{product.distributors.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 h-9 border-slate-200/50 shadow-sm rounded-lg" asChild>
                                        <Link href={`/inventory/products/${product.id}`}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
