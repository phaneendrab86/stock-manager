"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BillingType, CUSTOMER_TYPES } from "@/shared/types";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const customerSchema = z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    type: z.nativeEnum(BillingType),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
    creditLimit: z.number().min(0).optional(),
    businessName: z.string().optional(),
    region: z.string().optional(),
    notes: z.string().optional(),
    openingBalance: z.number().optional(),
});

interface CustomerFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    loading?: boolean;
}

export function CustomerForm({ initialData, onSubmit, loading }: CustomerFormProps) {
    const form = useForm<z.infer<typeof customerSchema>>({
        resolver: zodResolver(customerSchema),
            defaultValues: initialData || {
            name: "",
            phone: "",
            email: "",
                    type: BillingType.RESALE,
            address: "",
            gstNumber: "",
            creditLimit: 0,
            businessName: "",
            region: "",
            notes: "",
            openingBalance: 0,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="9876543210" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {CUSTOMER_TYPES.map((t) => (
                                            <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ').toLowerCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acme Corp" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Full address..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="gstNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GST Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="22AAAAA0000A1Z5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="creditLimit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Credit Limit</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="50000"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="openingBalance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Opening Balance</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any internal notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto px-12 rounded-xl">
                        {loading ? "Saving..." : initialData ? "Update Customer" : "Add Customer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
