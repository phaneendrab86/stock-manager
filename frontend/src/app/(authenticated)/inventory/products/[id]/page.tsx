"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ProductForm } from "@/components/product-form";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Info, Receipt, Truck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductDetailsPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();

    const { data: purchaseHistory, isLoading: historyLoading } = useQuery({
        queryKey: ["product-purchases", id],
        queryFn: async () => {
            const { data } = await api.get(`/products/${id}/purchases`);
            return data as any[];
        },
        enabled: !!id
    });

    if (!id) return <ProductForm />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="hover:bg-indigo-50 text-indigo-600 font-bold group px-2">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Button>
                <h2 className="text-3xl font-black tracking-tight text-slate-800 italic uppercase">Product Intelligence</h2>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-6">
                    <TabsTrigger value="details" className="rounded-lg px-6 font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Info className="h-3 w-3 mr-2" />
                        Details & Units
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-6 font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <History className="h-3 w-3 mr-2" />
                        Purchase History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-0 border-none outline-none">
                    <ProductForm id={id} />
                </TabsContent>

                <TabsContent value="history" className="mt-0 border-none outline-none pt-0">
                    <Card className="border-none shadow-xl rounded-[32px] overflow-hidden pt-0">
                        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Receipt className="h-6 w-6 text-indigo-200" />
                                <h3 className="text-xl font-black italic">Supply Chain History 123</h3>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                                {purchaseHistory?.length || 0} Records Found
                            </span>
                        </div>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                    <TableRow>
                                        <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Invoice No.</TableHead>
                                        <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</TableHead>
                                        <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Distributor</TableHead>
                                        <TableHead className="py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Qty (Units)</TableHead>
                                        <TableHead className="pr-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Unit Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 font-bold text-slate-300 italic uppercase tracking-widest">Scanning History...</TableCell>
                                        </TableRow>
                                    ) : purchaseHistory?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">No purchase records found for this product.</TableCell>
                                        </TableRow>
                                    ) : (
                                        purchaseHistory?.map((p: any) => (
                                            <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <TableCell className="pl-8 py-5">
                                                    <Link href={`/inventory/purchases/${p.purchaseId}`} className="font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                                                        {p.purchase.invoiceNumber}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-500 text-xs">
                                                    {new Date(p.purchase.purchaseDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="font-bold text-slate-900 dark:text-slate-100 italic">{p.purchase.distributor.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-black text-slate-900 dark:text-slate-100">
                                                    {p.quantity} <span className="text-[10px] text-slate-400 uppercase">{p.unitId}</span>
                                                </TableCell>
                                                <TableCell className="pr-8 text-right font-black text-emerald-600 dark:text-emerald-400">
                                                    ₹{p.purchasePrice.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
