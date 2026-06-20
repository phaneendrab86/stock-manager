"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save, Loader2, Calculator, Package, Building, Calendar, Receipt, Ticket, MinusCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function PurchaseEntryForm() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [selectedDistributorId, setSelectedDistributorId] = useState<string>("");

    const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            invoiceNumber: "",
            purchaseDate: new Date().toISOString().split('T')[0],
            distributorId: "",
            salesmanId: "",
            type: "CREDIT",
            paymentMode: "Cash",
            paidAmount: 0,
            items: [{ productId: "", unitId: "", quantity: 1, purchasePrice: 0, gstPercent: 0, discount: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    // Queries
    const { data: distributors } = useQuery({
        queryKey: ["distributors"],
        queryFn: async () => {
            const { data } = await api.get("/distributors");
            return data as any[];
        }
    });

    const { data: products } = useQuery({
        queryKey: ["products", selectedDistributorId],
        queryFn: async () => {
            const params = selectedDistributorId ? { distributorId: selectedDistributorId } : {};
            const { data } = await api.get("/products", { params });
            return data as any[];
        },
        enabled: true
    });

    // WATCH values for calculation
    const watchItems = watch("items");
    const watchPaidAmount = watch("paidAmount");

    const calculateItemTotal = (item: any) => {
        const subtotal = (item.quantity || 0) * (item.purchasePrice || 0);
        const gst = subtotal * ((item.gstPercent || 0) / 100);
        return subtotal + gst - (item.discount || 0);
    };

    const totalBillAmount = watchItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);
    const pendingAmount = totalBillAmount - (watchPaidAmount || 0);

    const purchaseMutation = useMutation({
        mutationFn: (data: any) => api.post("/purchases", data),
        onSuccess: () => {
            toast.success("Purchase recorded successfully!");
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["distributors"] });
            router.push("/inventory/purchases");
        },
        onError: (err: any) => {
            console.error("Purchase Mutation Error:", err);
            toast.error(err.response?.data?.message || "Failed to record purchase");
        }
    });

    const onSubmit = (data: any) => {
        console.log("Submitting Purchase Data:", data);
        if (!data.distributorId) {
            toast.error("Please select a distributor");
            return;
        }
        if (!data.items || data.items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }
        if (data.items.some((item: any) => !item.productId || !item.unitId)) {
            toast.error("Please select product and unit for all items");
            return;
        }
        purchaseMutation.mutate(data);
    };

    // For debugging - log form errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.warn("Form Validation Errors:", errors);
        }
    }, [errors]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 italic">P</div>
                        Purchase Entry
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Record and manage stock intake from suppliers.</p>
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-xs border-slate-200">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={purchaseMutation.isPending} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        {purchaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Purchase
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Details Card */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Basic Information</span>
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Distributor</Label>
                                <Select onValueChange={(val) => {
                                    setValue("distributorId", val);
                                    setSelectedDistributorId(val);
                                }}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-indigo-500/10">
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {distributors?.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Invoice Number (Optional)</Label>
                                <div className="relative">
                                    <Receipt className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        {...register("invoiceNumber")}
                                        placeholder="INV-2024-XXX"
                                        className="h-11 pl-10 rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Purchase Date</Label>
                                <Input type="date" {...register("purchaseDate", { required: true })} className="h-11 rounded-xl border-slate-200" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-3xl overflow-hidden self-start sticky top-24">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <Calculator className="h-4 w-4 text-indigo-400" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Payment Summary</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
                                <span className="text-4xl font-black tracking-tighter">₹{totalBillAmount.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-slate-800" />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paid Amount</span>
                                    <Input
                                        type="number"
                                        className="w-32 h-9 bg-slate-800 border-none text-right font-bold text-white focus:ring-indigo-500/50 rounded-lg pr-3"
                                        {...register("paidAmount", { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Due Amount</span>
                                    <span className={`text-xl font-bold tracking-tight ${pendingAmount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                                        ₹{pendingAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Method</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {["Cash", "UPI", "Bank", "Credit"].map(mode => (
                                    <Button
                                        key={mode}
                                        type="button"
                                        variant={watch("paymentMode") === mode ? "default" : "outline"}
                                        className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${watch("paymentMode") === mode ? "bg-indigo-600 border-none" : "border-slate-800 bg-transparent text-slate-400 hover:text-white"}`}
                                        onClick={() => setValue("paymentMode", mode)}
                                    >
                                        {mode}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Product Items Table */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Product List</span>
                    </div>
                    <Button type="button" size="sm" onClick={() => append({ productId: "", unitId: "", quantity: 1, purchasePrice: 0, gstPercent: 0, discount: 0 })} className="h-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-none shadow-none rounded-lg text-[10px] font-black uppercase tracking-wider">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Item
                    </Button>
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32">Unit</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 text-center">Qty</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32 text-right">Price</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 text-right">GST %</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 text-right">Disc.</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32 text-right">Total</th>
                                    <th className="px-6 py-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                                {fields.map((field, index) => {
                                    const item = watchItems[index];
                                    const selectedProduct = products?.find(p => p.id === item.productId);
                                    const total = calculateItemTotal(item);

                                    return (
                                        <tr key={field.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <Select onValueChange={(val) => {
                                                    setValue(`items.${index}.productId`, val);
                                                    // Set first unit as default
                                                    const p = products?.find(prod => prod.id === val);
                                                    if (p?.units?.length > 0) {
                                                        setValue(`items.${index}.unitId`, p.units[0].unitId);
                                                    }
                                                }} value={item.productId}>
                                                    <SelectTrigger className="h-10 border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none font-bold text-slate-900 dark:text-slate-100">
                                                        <SelectValue placeholder="Product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products?.map(p => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Select onValueChange={(val) => setValue(`items.${index}.unitId`, val)} value={item.unitId}>
                                                    <SelectTrigger className="h-10 border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none font-medium">
                                                        <SelectValue placeholder="Unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedProduct?.units?.map((u: any) => (
                                                            <SelectItem key={u.unitId} value={u.unitId}>{u.unit.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="h-10 border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none text-center font-bold" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input type="number" step="0.01" {...register(`items.${index}.purchasePrice`, { valueAsNumber: true })} className="h-10 border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none text-right font-bold" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input type="number" {...register(`items.${index}.gstPercent`, { valueAsNumber: true })} className="h-10 border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none text-right font-medium text-slate-500" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input type="number" {...register(`items.${index}.discount`, { valueAsNumber: true })} className="h-10 border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none text-right font-medium text-slate-500" />
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-black text-slate-900 dark:text-slate-100">₹{total.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {fields.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-slate-300 hover:text-rose-500 transition-colors">
                                                        <MinusCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
