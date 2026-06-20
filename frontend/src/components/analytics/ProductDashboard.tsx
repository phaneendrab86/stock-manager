"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Star, Zap, Trophy } from "lucide-react";
import { CustomBarChart, CustomDonutChart } from "./Charts";

export const ProductDashboard = ({ filters }: any) => {
    const { data: productData, isLoading } = useQuery({
        queryKey: ["productAnalytics", filters],
        queryFn: async () => {
            const { data } = await api.get("/analytics/top-selling", { params: filters });
            return data;
        },
    });

    if (isLoading) return <div>Loading Product Analytics...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Top 10 Selling Products (by Quantity)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={productData?.topProducts.map((p: any) => ({ name: p.name, value: p.quantity })) || []} xKey="name" yKey="value" />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Top 5 Selling Categories (by Revenue)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomDonutChart data={productData?.topCategories || []} />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Fastest Moving Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {productData?.topProducts.slice(0, 3).map((p: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {idx === 0 ? <Trophy className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                                    <div className="text-xs text-slate-500">{p.quantity} Units Sold</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
