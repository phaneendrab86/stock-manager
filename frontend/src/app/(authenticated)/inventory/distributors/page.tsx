"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreatePurchasePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [purchaseDetails, setPurchaseDetails] = useState({
        invoiceNumber: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        paidAmount: "0",
    });

    // Fetch all distributors for the main selector
    const { data: distributors, isLoading: distributorsLoading } = useQuery({
        queryKey: ["distributors"],
        queryFn: () => api.get("/distributors").then((res) => res.data),
    });

    // Fetch the selected distributor's details, which includes their associated products
    const { data: selectedDistributor, isLoading: productsLoading } = useQuery({
        queryKey: ["distributor", selectedDistributorId],
        queryFn: () => api.get(`/distributors/${selectedDistributorId}`).then((res) => res.data),
        enabled: !!selectedDistributorId, // Only run this query when a distributor is selected
    });

    const handleDistributorChange = (distributorId: string) => {
        setSelectedDistributorId(distributorId);
        setItems([]); // Reset items when distributor changes
    };

    const addRow = () => {
        setItems([...items, { productId: "", quantity: 1, purchasePrice: 0, gstPercent: 0, discount: 0 }]);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const createPurchaseMutation = useMutation({
        mutationFn: (data: any) => api.post("/purchases", data),
        onSuccess: () => {
            toast.success("Purchase created successfully!");
            queryClient.invalidateQueries({ queryKey: ["purchases"] });
            router.push("/inventory/purchases");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create purchase.");
        },
    });

    const handleSubmit = () => {
        if (!selectedDistributorId) {
            toast.error("Please select a distributor.");
            return;
        }
        if (items.length === 0) {
            toast.error("Please add at least one item to the purchase.");
            return;
        }

        const payload = {
            ...purchaseDetails,
            distributorId: selectedDistributorId,
            paidAmount: parseFloat(purchaseDetails.paidAmount) || 0,
            items: items.map(item => ({
                ...item,
                quantity: parseInt(item.quantity, 10),
                purchasePrice: parseFloat(item.purchasePrice),
                gstPercent: parseFloat(item.gstPercent),
                discount: parseFloat(item.discount),
            })),
        };

        createPurchaseMutation.mutate(payload);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">New Purchase Entry</h2>
                    <p className="text-muted-foreground">Record a new stock purchase from a supplier.</p>
                </div>
                 <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Purchases
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium">Distributor</label>
                        <Select onValueChange={handleDistributorChange} disabled={distributorsLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder={distributorsLoading ? "Loading..." : "Select a supplier"} />
                            </SelectTrigger>
                            <SelectContent>
                                {distributors?.map((d: any) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Invoice Number</label>
                        <Input placeholder="e.g., INV-12345" value={purchaseDetails.invoiceNumber} onChange={e => setPurchaseDetails({...purchaseDetails, invoiceNumber: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Purchase Date</label>
                        <Input type="date" value={purchaseDetails.purchaseDate} onChange={e => setPurchaseDetails({...purchaseDetails, purchaseDate: e.target.value})} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>GST %</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Select onValueChange={(v) => updateItem(index, "productId", v)} disabled={productsLoading || !selectedDistributorId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={productsLoading ? "Loading products..." : "Select product"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedDistributor?.products?.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell><Input type="number" value={item.quantity} onChange={e => updateItem(index, "quantity", e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" value={item.purchasePrice} onChange={e => updateItem(index, "purchasePrice", e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" value={item.gstPercent} onChange={e => updateItem(index, "gstPercent", e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" value={item.discount} onChange={e => updateItem(index, "discount", e.target.value)} /></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button onClick={addRow} variant="outline" className="mt-4" disabled={!selectedDistributorId}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button onClick={handleSubmit} disabled={createPurchaseMutation.isPending}>
                    {createPurchaseMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Purchase
                </Button>
            </div>
        </div>
    );
}