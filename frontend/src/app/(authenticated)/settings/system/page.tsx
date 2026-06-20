"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, Building2, MapPin, Phone, Mail, FileText, Globe, Landmark, Ticket, Gift } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function SystemSettingsPage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        businessName: "",
        address: "",
        phone: "",
        email: "",
        taxId: "",
        currency: "INR",
        currencySymbol: "₹",
        couponEnabled: true,
        freeGiftsEnabled: true,
    });

    const { data: config, isLoading } = useQuery({
        queryKey: ["system-config"],
        queryFn: async () => {
            const { data } = await api.get("/system-config");
            return data;
        },
    });

    useEffect(() => {
        if (config) {
            setFormData({
                businessName: config.businessName || "",
                address: config.address || "",
                phone: config.phone || "",
                email: config.email || "",
                taxId: config.taxId || "",
                currency: config.currency || "INR",
                currencySymbol: config.currencySymbol || "₹",
                couponEnabled: config.couponEnabled ?? true,
                freeGiftsEnabled: config.freeGiftsEnabled ?? true,
            });
        }
    }, [config]);

    const mutation = useMutation({
        mutationFn: (data: any) => api.patch("/system-config", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-config"] });
            toast.success("System configurations updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update configurations");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">System Configurations</h2>
                <p className="text-muted-foreground text-sm">Manage business identity and regional preferences.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 p-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Business Identity</CardTitle>
                                <CardDescription className="text-slate-500">Official details used for invoicing and reports.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="businessName" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Legal Business Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="businessName"
                                        className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxId" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Tax Identification (GSTIN/VAT)</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="taxId"
                                        className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        placeholder="e.g. 29AAAAA0000A1Z5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Headquarters Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="address"
                                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Support Contact</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Business Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 p-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                                <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Localization</CardTitle>
                                <CardDescription className="text-slate-500">Configure regional financial display settings.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Base Currency Code</Label>
                                <div className="relative">
                                    <Landmark className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="currency"
                                        className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20 font-mono"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                        placeholder="INR"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currencySymbol" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Currency Symbol</Label>
                                <Input
                                    id="currencySymbol"
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20 text-center text-lg font-bold"
                                    value={formData.currencySymbol}
                                    onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Toggles */}
                <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 p-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center border border-violet-100 dark:border-violet-900/50">
                                <Ticket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Feature Toggles</CardTitle>
                                <CardDescription className="text-slate-500">Enable or disable billing features across the system.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {/* Coupon System */}
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
                                    <Ticket className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <Label htmlFor="couponEnabled" className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">Coupon System</Label>
                                    <p className="text-xs text-slate-500 mt-0.5">Allow discount coupons to be applied during billing checkout.</p>
                                </div>
                            </div>
                            <Switch
                                id="couponEnabled"
                                checked={formData.couponEnabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, couponEnabled: checked })}
                                className="data-[state=checked]:bg-violet-500"
                            />
                        </div>

                        {/* Free Gifts */}
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                                    <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <Label htmlFor="freeGiftsEnabled" className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">Free Gifts</Label>
                                    <p className="text-xs text-slate-500 mt-0.5">Show eligible free gift offers to customers during billing.</p>
                                </div>
                            </div>
                            <Switch
                                id="freeGiftsEnabled"
                                checked={formData.freeGiftsEnabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, freeGiftsEnabled: checked })}
                                className="data-[state=checked]:bg-amber-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" className="h-12 px-10 rounded-2xl shadow-lg shadow-primary/20 text-md font-bold" disabled={mutation.isPending}>
                        {mutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Commit Configuration
                    </Button>
                </div>
            </form>
        </div>
    );
}
