"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, Loader2, Calculator, Package, Building2, Calendar, Receipt, Minus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PurchaseEntryForm() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);

    const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<{
        invoiceNumber: string;
        purchaseDate: string;
        distributorId: string | null;
        paidAmount: number;
        paymentMode: string;
        items: { productId: string; unitId: string; quantity: number; purchasePrice: number; gstPercent: number; discount: number; }[];
    }>({
        defaultValues: {
            invoiceNumber: "",
            purchaseDate: new Date().toISOString().split('T')[0],
            distributorId: null,
            paymentMode: "Cash",
            paidAmount: 0,
            items: [{ productId: "", unitId: "", quantity: 1, purchasePrice: 0, gstPercent: 0, discount: 0 }]
        }
    });

    const { fields, append, remove, update } = useFieldArray({ control, name: "items" });

    // Fetch all distributors for the selector
    const { data: distributors } = useQuery({
        queryKey: ["distributors"],
        queryFn: async () => (await api.get("/distributors")).data as any[],
    });

    // Fetch selected distributor's details (which includes their products)
    const { data: selectedDistributor, isLoading: productsLoading } = useQuery({
        queryKey: ["distributor", selectedDistributorId],
        queryFn: async () => (await api.get(`/distributors/${selectedDistributorId}`)).data,
        enabled: !!selectedDistributorId,
    });

    // Watch form values for real-time calculations
    const watchItems = watch("items");
    const watchPaidAmount = watch("paidAmount");

    const calculateItemTotal = (item: any) => {
        const subtotal = (item.quantity || 0) * (item.purchasePrice || 0);
        const gst = subtotal * ((item.gstPercent || 0) / 100);
        const total = subtotal + gst - (item.discount || 0);
        return isNaN(total) ? 0 : total;
    };

    const totalBillAmount = watchItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);
    const pendingAmount = totalBillAmount - (watchPaidAmount || 0);

    const purchaseMutation = useMutation({
        mutationFn: (data: any) => api.post("/purchases", { ...data, paidAmount: Number(data.paidAmount) || 0 }),
        onSuccess: () => {
            toast.success("Purchase recorded successfully!");
            queryClient.invalidateQueries({ queryKey: ["purchases"] });
            router.push("/inventory/purchases");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to record purchase"),
    });

    const onSubmit = (data: any) => {
        if (!data.distributorId) {
            toast.error("Please select a distributor");
            return;
        }
        if (data.items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }
        purchaseMutation.mutate(data);
    };

    useEffect(() => {
        // When distributor changes, reset the items array
        setValue("items", [{ productId: "", unitId: "", quantity: 1, purchasePrice: 0, gstPercent: 0, discount: 0 }]);
    }, [selectedDistributorId, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        New Purchase Entry
                    </h2>
                    <p className="text-muted-foreground mt-1">Record and manage stock intake from suppliers.</p>
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Purchases
                    </Button>
                    <Button type="submit" disabled={purchaseMutation.isPending}>
                        {purchaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Purchase
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Supplier Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <Label>Distributor</Label>
                                <Controller
                                    name="distributorId"
                                    control={control}
                                    rules={{ required: "Distributor is required" }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setSelectedDistributorId(val);
                                            }}
                                            value={field.value || ""}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                                            <SelectContent>
                                                {distributors?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.distributorId && <p className="text-xs text-destructive mt-1">{errors.distributorId.message}</p>}
                            </div>
                            <div>
                                <Label>Invoice Number</Label>
                                <Input {...register("invoiceNumber")} placeholder="e.g., INV-12345" />
                            </div>
                            <div>
                                <Label>Purchase Date</Label>
                                <Input type="date" {...register("purchaseDate", { required: true })} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[35%]">Product</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>GST%</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead className="text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => {
                                        const item = watchItems[index];
                                        const selectedProduct = selectedDistributor?.products?.find((p: any) => p.id === item.productId);
                                        return (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    <Select
                                                        value={item.productId}
                                                        onValueChange={(val) => {
                                                            const product = selectedDistributor?.products?.find((p: any) => p.id === val);
                                                            update(index, { ...item, productId: val, unitId: product?.units?.[0]?.unitId || "" });
                                                        }}
                                                        disabled={!selectedDistributorId || productsLoading}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder={productsLoading ? "Loading..." : "Select product"} /></SelectTrigger>
                                                        <SelectContent>
                                                            {selectedDistributor?.products?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={item.unitId}
                                                        onValueChange={(val) => update(index, { ...item, unitId: val })}
                                                        disabled={!selectedProduct}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                                                        <SelectContent>
                                                            {selectedProduct?.units?.map((u: any) => <SelectItem key={u.unitId} value={u.unitId}>{u.unit.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell><Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true, min: 1 })} className="w-16 text-center" /></TableCell>
                                                <TableCell><Input type="number" {...register(`items.${index}.purchasePrice`, { valueAsNumber: true })} className="w-24" /></TableCell>
                                                <TableCell><Input type="number" {...register(`items.${index}.gstPercent`, { valueAsNumber: true })} className="w-20" /></TableCell>
                                                <TableCell className="font-bold">₹{calculateItemTotal(item).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <Button type="button" variant="outline" className="mt-4" onClick={() => append({ productId: "", unitId: "", quantity: 1, purchasePrice: 0, gstPercent: 0, discount: 0 })} disabled={!selectedDistributorId}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="sticky top-24 self-start">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Summary & Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Amount</span>
                                    <span className="font-bold">₹{totalBillAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Paid Amount</span>
                                    <span className="font-bold text-green-600">₹{(watchPaidAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                    <span>Due Amount</span>
                                    <span className={pendingAmount > 0 ? "text-destructive" : "text-green-600"}>₹{pendingAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div>
                                <Label>Payment Mode</Label>
                                <Controller
                                    name="paymentMode"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="UPI">UPI</SelectItem>
                                                <SelectItem value="Bank">Bank Transfer</SelectItem>
                                                <SelectItem value="Credit">Credit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div>
                                <Label>Amount Paid Now</Label>
                                <Input type="number" {...register("paidAmount", { valueAsNumber: true })} placeholder="Enter amount paid" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}

