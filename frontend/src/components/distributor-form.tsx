"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Building2, Phone, Mail, MapPin, Users, Package, Plus, Trash2, Check, ChevronsUpDown, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DistributorFormProps {
    initialData?: any;
    onSuccess: () => void;
}

export function DistributorForm({ initialData, onSuccess }: DistributorFormProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("basic");
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState("");

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: initialData?.name || "",
            contactPerson: initialData?.contactPerson || "",
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            address: initialData?.address || "",
            gstNumber: initialData?.gstNumber || "",
            notes: initialData?.notes || "",
            salesmen: initialData?.salesmen?.map((s: any) => ({
                id: s.id,
                name: s.name,
                phone: s.phone,
                email: s.email || "",
                designation: s.designation || "",
                isActive: s.isActive !== undefined ? s.isActive : true,
                productIds: s.products?.map((p: any) => p.id) || []
            })) || [],
            productIds: initialData?.products?.map((p: any) => p.id) || []
        }
    });

    const { fields: salesmenFields, append: appendSalesman, remove: removeSalesman } = useFieldArray({
        control,
        name: "salesmen"
    });

    const selectedProductIds = watch("productIds");

    const { data: products } = useQuery({
        queryKey: ["products"],
        queryFn: async () => (await api.get("/products")).data as any[]
    });

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.sku?.toLowerCase().includes(productSearch.toLowerCase())
        );
    }, [products, productSearch]);

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post("/distributors", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["distributors"] });
            toast.success("Distributor created successfully!");
            onSuccess();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create distributor"),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.patch(`/distributors/${initialData.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["distributors"] });
            toast.success("Distributor updated successfully!");
            onSuccess();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update distributor"),
    });

    const onSubmit = (data: any) => {
        if (initialData) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const toggleProduct = (productId: string) => {
        const current = [...selectedProductIds];
        const index = current.indexOf(productId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(productId);
        }
        setValue("productIds", current);
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                    <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 py-2.5">
                        <Building2 className="h-4 w-4" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Basic Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="salesmen" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 py-2.5">
                        <Users className="h-4 w-4" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Salesmen</span>
                    </TabsTrigger>
                    <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 py-2.5">
                        <Package className="h-4 w-4" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Products</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Distributor Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    {...register("name", { required: "Name is required" })}
                                    placeholder="Enter business name"
                                    className="h-11 pl-10 border-slate-200 focus:ring-indigo-500/20 rounded-xl"
                                />
                            </div>
                            {errors.name && <p className="text-xs text-rose-500 font-bold">{errors.name.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Person</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    {...register("contactPerson")}
                                    placeholder="Enter name"
                                    className="h-11 pl-10 border-slate-200 focus:ring-indigo-500/20 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    {...register("phone")}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="h-11 pl-10 border-slate-200 focus:ring-indigo-500/20 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    {...register("email")}
                                    type="email"
                                    placeholder="distributor@example.com"
                                    className="h-11 pl-10 border-slate-200 focus:ring-indigo-500/20 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GST Number</Label>
                            <Input
                                {...register("gstNumber")}
                                placeholder="GSTIN12345678"
                                className="h-11 border-slate-200 focus:ring-indigo-500/20 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    {...register("address")}
                                    placeholder="Business address"
                                    className="h-11 pl-10 border-slate-200 focus:ring-indigo-500/20 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notes / Internal Remarks</Label>
                        <Textarea
                            {...register("notes")}
                            placeholder="Any additional information about this distributor..."
                            className="min-h-[100px] border-slate-200 focus:ring-indigo-500/20 rounded-2xl p-4"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="salesmen" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-500" />
                                Manage Salesmen
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Add or manage salesmen for this distributor</p>
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={() => appendSalesman({ name: "", phone: "", email: "", designation: "", isActive: true, productIds: [] })}
                            className="border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold uppercase tracking-widest text-[9px] h-8 rounded-lg"
                        >
                            <Plus className="h-3 w-3 mr-1.5" />
                            Add Salesman
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {salesmenFields.map((field, index) => (
                            <Card key={field.id} className="border-slate-100 shadow-sm overflow-hidden group">
                                <CardContent className="p-4 grid grid-cols-12 gap-4 items-end">
                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400">Name</Label>
                                        <Input {...register(`salesmen.${index}.name` as const)} placeholder="Salesman Name" className="h-9 border-slate-100 rounded-lg text-sm" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400">Phone</Label>
                                        <Input {...register(`salesmen.${index}.phone` as const)} placeholder="Phone" className="h-9 border-slate-100 rounded-lg text-sm" />
                                    </div>
                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400">Email (Opt)</Label>
                                        <Input {...register(`salesmen.${index}.email` as const)} placeholder="Email" className="h-9 border-slate-100 rounded-lg text-sm" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400">Designation</Label>
                                        <Input {...register(`salesmen.${index}.designation` as const)} placeholder="Role/Title" className="h-9 border-slate-100 rounded-lg text-sm" />
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center p-2 mt-auto">
                                        <Checkbox 
                                            checked={watch(`salesmen.${index}.isActive`)} 
                                            onCheckedChange={(val) => setValue(`salesmen.${index}.isActive`, !!val)}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Button 
                                            type="button" 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => removeSalesman(index)}
                                            className="h-9 w-9 text-rose-500 hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {salesmenFields.length === 0 && (
                            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                <Users className="h-6 w-6 text-slate-300 mb-2 opacity-50" />
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No salesmen added yet</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Package className="h-4 w-4 text-indigo-500" />
                                Product Assignments
                            </h3>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Select products handled by this distributor</p>
                        </div>
                        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    type="button" 
                                    size="sm" 
                                    className="bg-slate-900 text-white hover:bg-black font-bold uppercase tracking-widest text-[9px] h-8 rounded-lg px-4"
                                >
                                    <Plus className="h-3 w-3 mr-1.5" />
                                    Create New Product
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black uppercase tracking-widest text-slate-900 border-b pb-4 mb-4">Add New Product Inline</DialogTitle>
                                </DialogHeader>
                                <ProductForm 
                                    inline 
                                    onSuccess={(product) => {
                                        queryClient.setQueryData(["products"], (old: any) => [...(old || []), product]);
                                        toggleProduct(product.id);
                                        setIsProductModalOpen(false);
                                        toast.success("New product added to catalog and assigned!");
                                    }} 
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card className="border-slate-100 overflow-hidden rounded-2xl">
                        <CardContent className="p-0">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                <Input 
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Search brands or products..." 
                                    className="h-9 border-slate-200 bg-white"
                                />
                            </div>
                            <ScrollArea className="h-[300px] p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {filteredProducts.map((product) => (
                                        <div 
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 group ${
                                                selectedProductIds.includes(product.id)
                                                ? "bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200"
                                                : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50"
                                            }`}
                                        >
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className={`text-xs font-bold truncate ${selectedProductIds.includes(product.id) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {product.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">#{product.sku || 'No SKU'}</span>
                                            </div>
                                            <div className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                                                selectedProductIds.includes(product.id)
                                                ? "bg-indigo-600 border-indigo-600 text-white"
                                                : "border-slate-200 bg-white"
                                            }`}>
                                                {selectedProductIds.includes(product.id) && <Check className="h-3 w-3 stroke-[4px]" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {filteredProducts.length === 0 && (
                                    <div className="py-20 text-center">
                                        <p className="text-xs text-slate-400 font-bold uppercase">No products found</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selected Products ({selectedProductIds.length})</Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedProductIds.map((pid: string) => {
                                const product = products?.find(p => p.id === pid);
                                if (!product) return null;
                                return (
                                    <Badge key={pid} variant="secondary" className="h-7 px-3 bg-indigo-50 text-indigo-700 border-indigo-100 gap-1.5 flex items-center">
                                        {product.name}
                                        <X className="h-3 w-3 cursor-pointer hover:text-rose-500" onClick={(e) => { e.stopPropagation(); toggleProduct(pid); }} />
                                    </Badge>
                                );
                            })}
                            {selectedProductIds.length === 0 && <p className="text-[10px] text-slate-400">No products selected yet.</p>}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setActiveTab(activeTab === "products" ? "salesmen" : activeTab === "salesmen" ? "basic" : "basic")}
                        disabled={activeTab === "basic"}
                        className="h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600"
                    >
                        Back
                    </Button>
                </div>
                <div className="flex gap-3">
                    {activeTab !== "products" ? (
                        <Button 
                            type="button" 
                            onClick={() => setActiveTab(activeTab === "basic" ? "salesmen" : "products")}
                            className="bg-slate-900 border-slate-900 text-white shadow-lg h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button 
                            type="submit" 
                            disabled={isPending} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {initialData ? "Update Distributor" : "Create Distributor"}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
