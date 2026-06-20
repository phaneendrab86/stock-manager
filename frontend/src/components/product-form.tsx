"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { BillingType } from "@/shared/types";

const UNIT_SUGGESTIONS: Record<string, string[]> = {
    "Tobacco Products": ["Pack", "Tube", "Piece"],
    "Beverages": ["Case", "Piece"],
    "Pan Masala": ["Bag", "Bori", "Piece"],
};

interface ProductFormProps {
    id?: string;
    onSuccess?: (product: any) => void;
    inline?: boolean;
}

export function ProductForm({ id, onSuccess, inline = false }: ProductFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<any>({
        name: "",
        categoryId: "",
        sku: "",
        barcode: "",
        shortCode: "",
        gstPercent: 0,
        hsn: "",
        units: [], // New structure: { unitId, conversion, isBase }
        prices: [
            { billingType: BillingType.RESALE, price: 0 },
            { billingType: BillingType.WHOLESALE, price: 0 },
            { billingType: BillingType.WALK_AWAY, price: 0 },
            { billingType: BillingType.DELIVERY, price: 0 },
        ],
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => (await api.get("/categories")).data as any[],
    });

    const { data: units } = useQuery({
        queryKey: ["units"],
        queryFn: async () => (await api.get("/units")).data as any[],
    });

    const { isLoading: isFetchingProduct } = useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get(`/products/${id}`);
            setFormData({
                ...data,
                units: data.units.map((u: any) => ({
                    unitId: u.unitId,
                    conversion: u.conversion,
                    isBase: u.isBase
                })),
                prices: [
                    { billingType: BillingType.RESALE, price: data.prices?.find((p: any) => p.billingType === BillingType.RESALE)?.price || 0 },
                    { billingType: BillingType.WHOLESALE, price: data.prices?.find((p: any) => p.billingType === BillingType.WHOLESALE)?.price || 0 },
                    { billingType: BillingType.WALK_AWAY, price: data.prices?.find((p: any) => p.billingType === BillingType.WALK_AWAY)?.price || 0 },
                    { billingType: BillingType.DELIVERY, price: data.prices?.find((p: any) => p.billingType === BillingType.DELIVERY)?.price || 0 },
                ],
            });
            return data;
        },
        enabled: !!id,
    });

    const mutation = useMutation({
        mutationFn: (data: any) => id ? api.patch(`/products/${id}`, data) : api.post("/products", data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success(`Product ${id ? "updated" : "created"} successfully`);
            if (onSuccess) {
                onSuccess(response.data);
            } else {
                router.push("/inventory/products");
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || `Failed to ${id ? "update" : "create"} product`);
        },
    });

    const handlePriceChange = (index: number, value: string) => {
        const newPrices = [...formData.prices];
        newPrices[index].price = parseFloat(value) || 0;
        setFormData({ ...formData, prices: newPrices });
    };

    const handleUnitToggle = (unitId: string) => {
        const isSelected = formData.units.some((u: any) => u.unitId === unitId);
        if (isSelected) {
            setFormData({
                ...formData,
                units: formData.units.filter((u: any) => u.unitId !== unitId)
            });
        } else {
            setFormData({
                ...formData,
                units: [...formData.units, { unitId, conversion: 1, isBase: formData.units.length === 0 }]
            });
        }
    };

    const handleConversionChange = (unitId: string, value: string) => {
        setFormData({
            ...formData,
            units: formData.units.map((u: any) =>
                u.unitId === unitId ? { ...u, conversion: parseInt(value) || 1 } : u
            )
        });
    };

    const handleBaseUnitChange = (unitId: string) => {
        setFormData({
            ...formData,
            units: formData.units.map((u: any) => ({
                ...u,
                isBase: u.unitId === unitId
            }))
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (id && isFetchingProduct) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {!inline && (
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" type="button" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {id ? "Edit Product" : "New Product"}
                    </h2>
                    <Button className="ml-auto" type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Product
                    </Button>
                </div>
            )}

            <div className={`grid gap-6 ${inline ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Category</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                    id="barcode"
                                    value={formData.barcode || ""}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shortCode">Short Code <span className="text-muted-foreground font-normal text-xs">(Print Only)</span></Label>
                            <Input
                                id="shortCode"
                                value={formData.shortCode || ""}
                                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory & Units</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.categoryId && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {(() => {
                                    const categoryName = categories?.find(c => c.id === formData.categoryId)?.name;
                                    const suggestions = categoryName ? UNIT_SUGGESTIONS[categoryName] : [];
                                    if (!suggestions?.length) return null;

                                    return (
                                        <div className="w-full space-y-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Suggested for {categoryName}</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestions.map(s => {
                                                    const unitId = units?.find((u: any) => u.name === s)?.id;
                                                    if (!unitId) return null;
                                                    const isSelected = formData.units.some((u: any) => u.unitId === unitId);

                                                    return (
                                                        <Badge
                                                            key={s}
                                                            variant={isSelected ? "default" : "outline"}
                                                            className="cursor-pointer hover:bg-primary/10"
                                                            onClick={() => handleUnitToggle(unitId)}
                                                        >
                                                            {isSelected ? "✓ " : "+ "}{s}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                        <div className="space-y-4">
                            <Label>Manage Supported Units</Label>

                            <div className="grid grid-cols-1 gap-3">
                                {units?.map((unit: any) => {
                                    const productUnit = formData.units.find((u: any) => u.unitId === unit.id);
                                    const isSelected = !!productUnit;

                                    return (
                                        <div key={unit.id} className={`flex flex-col gap-3 p-3 border rounded-lg transition-colors ${isSelected ? 'bg-primary/5 border-primary/20' : 'bg-transparent'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`unit-${unit.id}`}
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleUnitToggle(unit.id)}
                                                    />
                                                    <Label htmlFor={`unit-${unit.id}`} className="font-bold cursor-pointer">
                                                        {unit.name}
                                                    </Label>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Base Unit?</span>
                                                        <Checkbox
                                                            checked={productUnit.isBase}
                                                            onCheckedChange={() => handleBaseUnitChange(unit.id)}
                                                            className="rounded-full"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {isSelected && !productUnit.isBase && (
                                                <div className="flex items-center gap-3 pl-6">
                                                    <Label className="text-xs text-muted-foreground">Conversion Factor:</Label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-muted-foreground">1 {unit.name} =</span>
                                                        <Input
                                                            type="number"
                                                            className="h-8 w-20 text-center font-mono"
                                                            value={productUnit.conversion}
                                                            onChange={(e) => handleConversionChange(unit.id, e.target.value)}
                                                        />
                                                        <span className="text-xs text-muted-foreground">Base Units</span>
                                                    </div>
                                                </div>
                                            )}

                                            {isSelected && productUnit.isBase && (
                                                <p className="text-[10px] text-primary/60 font-semibold uppercase tracking-wider pl-6">
                                                    Primary measuring unit for stock & pricing
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gst">GST %</Label>
                                <Input
                                    id="gst"
                                    type="number"
                                    value={formData.gstPercent}
                                    onChange={(e) => setFormData({ ...formData, gstPercent: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hsn">HSN Code</Label>
                                <Input
                                    id="hsn"
                                    value={formData.hsn}
                                    onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={inline ? '' : 'md:col-span-2'}>
                    <CardHeader>
                        <CardTitle>Pricing (per Base Unit)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`grid gap-4 ${inline ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
                            {formData.prices.map((p: any, index: number) => (
                                <div key={p.billingType} className="space-y-2 text-center p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                    <Label className="capitalize font-bold text-xs">{p.billingType.replace('_', ' ')}</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={p.price}
                                        onChange={(e) => handlePriceChange(index, e.target.value)}
                                        className="text-center font-mono h-9"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {inline && (
                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-950 p-4 border-t z-10">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Product
                    </Button>
                </div>
            )}
        </form>
    );
}
