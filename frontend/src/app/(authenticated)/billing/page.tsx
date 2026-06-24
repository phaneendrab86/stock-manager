"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Receipt, ShoppingCart, User, PlusCircle, Trash2, Minus, CheckCircle2, Printer, Loader2, LayoutGrid, List, Wallet, Banknote, Sparkles, ChevronDown, ChevronUp, Check, FileX, Gift } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BillingType, PaymentMode } from "@/shared/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CustomerForm } from "@/components/customers/CustomerForm";

const getProductPrice = (product: any, type: BillingType) => {
    return product.prices?.find((p: any) => p.billingType === type)?.price || 0;
};

const CustomerSearchCell = ({
    item,
    onSelect,
    customers,
    isCompactView
}: {
    item?: any,
    onSelect: (customer: any) => void,
    customers: any[],
    isCompactView: boolean
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(item?.name || "");

    useEffect(() => {
        setQuery(item?.name || "");
    }, [item?.name]);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <div className="w-full md:w-64">
                    <Input
                        placeholder="Search customer..."
                        value={query || ""}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                        }}
                        className={cn(
                            "bg-white dark:bg-slate-950 border-slate-200 rounded-xl h-9 placeholder:text-slate-400 dark:placeholder:text-slate-600",
                            isCompactView ? "text-sm" : "text-base font-semibold"
                        )}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="p-0 w-[400px] shadow-2xl border-slate-200 dark:border-slate-800"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <ScrollArea className="h-[300px]">
                    <div className="p-1">
                        <button
                            className="w-full flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left group"
                            onClick={() => {
                                onSelect({ id: null, name: "", type: BillingType.WHOLESALE });
                                setQuery("");
                                setOpen(false);
                            }}
                        >
                            <div className="font-bold text-sm">Walking Customer</div>
                        </button>
                        {filtered.length === 0 ? (
                            query !== "" && <div className="p-4 text-center text-sm text-muted-foreground italic">No customers found</div>
                        ) : (
                            filtered.map(c => (
                                <button
                                    key={c.id}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left group"
                                    onClick={() => {
                                        onSelect(c);
                                        setQuery(c.name);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="font-bold text-sm truncate">{c.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-500">{c.phone || 'No Phone'}</span>
                                            <Badge variant="outline" className="text-[9px] h-4 py-0 font-mono uppercase">{c.type}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] text-slate-400 font-bold uppercase">Balance: ₹{c.outstandingBalance?.toFixed(2) || '0.00'}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

const ProductSearchCell = ({
    item,
    onSelect,
    products,
    billingType,
    isCompactView,
    id
}: {
    item?: any,
    onSelect: (product: any) => void,
    products: any[],
    billingType: BillingType,
    isCompactView: boolean,
    id?: string
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(item?.name || "");

    // Sync query if item changes
    useEffect(() => {
        setQuery(item?.name || "");
    }, [item?.name]);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku?.toLowerCase().includes(query.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(query.toLowerCase()) ||
        p.shortCode?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && filtered.length > 0) {
            e.preventDefault();
            // Try to find exact match on SKU, Barcode, or ShortCode first
            const exactMatch = filtered.find(p =>
                p.sku?.toLowerCase() === query.toLowerCase() ||
                p.barcode?.toLowerCase() === query.toLowerCase() ||
                p.shortCode?.toLowerCase() === query.toLowerCase()
            );

            const selectedProduct = exactMatch || filtered[0];
            onSelect(selectedProduct);
            setQuery("");
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <div className="w-full">
                    <Input
                        id={id}
                        placeholder="Search product..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "bg-transparent border-none p-0 h-auto shadow-none focus-visible:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600",
                            isCompactView ? "text-sm" : "text-base font-semibold"
                        )}
                    />
                    {item && (
                        <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                            {item.sku}
                        </div>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="p-0 w-[400px] shadow-2xl border-slate-200 dark:border-slate-800"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <ScrollArea className="h-[300px]">
                    <div className="p-1">
                        {filtered.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground italic">No products found</div>
                        ) : (
                            filtered.map(p => (
                                <button
                                    key={p.id}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left group"
                                    onClick={() => {
                                        onSelect(p);
                                        setQuery("");
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="font-bold text-sm truncate">{p.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="text-[9px] h-4 py-0 font-mono">{p.sku}</Badge>
                                            <span className="text-[10px] text-slate-500">Stock: {p.stock}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-primary font-black text-sm">₹{getProductPrice(p, billingType).toFixed(2)}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase">{billingType}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default function BillingPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [billingType, setBillingType] = useState<BillingType>(BillingType.WHOLESALE);
    const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.CASH);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [lastInvoice, setLastInvoice] = useState<any>(null);
    const [isCompactView, setIsCompactView] = useState(true);
    const [receivedCash, setReceivedCash] = useState<number | ''>(0);
    const [receivedUPI, setReceivedUPI] = useState<number | ''>('');
    const [creditReceived, setCreditReceived] = useState<number | ''>('');
    const [searchTerm, setSearchTerm] = useState("");
    const [activePaymentModes, setActivePaymentModes] = useState<PaymentMode[]>([PaymentMode.CASH]);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [drafts, setDrafts] = useState<any[]>([]);

    // Load drafts from localStorage
    useEffect(() => {
        const savedDrafts = localStorage.getItem('billing-drafts');
        if (savedDrafts) {
            try {
                setDrafts(JSON.parse(savedDrafts));
            } catch (e) {
                console.error("Failed to load drafts", e);
            }
        }
    }, []);

    // Save drafts to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('billing-drafts', JSON.stringify(drafts));
    }, [drafts]);

    const resetForm = useCallback(() => {
        setCart([]);
        setCustomerName("");
        setCustomerId(null);
        setReceivedCash("");
        setReceivedUPI("");
        setCreditReceived("");
        setActivePaymentModes([]);
    }, []);

    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            try {
                return (await api.get("/products")).data;
            } catch (e) {
                return [];
            }
        }
    });

    const { data: customers = [], refetch: refetchCustomers } = useQuery({
        queryKey: ["customers"],
        queryFn: async () => (await api.get("/customers")).data
    });

    const { data: rewardSettings } = useQuery({
        queryKey: ["reward-settings"],
        queryFn: async () => (await api.get("/admin/rewards/settings")).data,
    });

    const couponEnabled = rewardSettings?.enabled && rewardSettings?.mode === 'DISCOUNT';
    const freeGiftsEnabled = rewardSettings?.enabled && rewardSettings?.mode === 'GIFT';

    const handleAddCustomer = async (data: any) => {
        setIsCreatingCustomer(true);
        try {
            const res = await api.post("/customers", data);
            toast.success("Customer added successfully!");
            await refetchCustomers();
            setCustomerId(res.data.id);
            setCustomerName(res.data.name);
            setBillingType(res.data.type as BillingType);
            setIsAddCustomerOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add customer");
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    const { data: customerCoupons = [], refetch: refetchCoupons } = useQuery({
        queryKey: ["customer-coupons", customerId],
        queryFn: async () => {
            if (!customerId) return [];
            return (await api.get(`/coupons/customer/${customerId}`)).data;
        },
        enabled: !!customerId && couponEnabled
    });


    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const checkoutMutation = useMutation({
        mutationFn: async (invoiceData: any) => (await api.post("/invoices", invoiceData)).data,
        onSuccess: (data) => {
            setLastInvoice({
                id: data.id.substring(0, 8).toUpperCase(),
                total: data.netAmount,
                customer: customerName || "Walking Customer",
                date: new Date(data.createdAt).toLocaleString(),
                paymentMode: data.paymentMode,
                couponDiscount: data.discount, // Include automatic discount
                items: cart.map(item => ({ ...item })),
                giftAllocations: data.giftAllocation ? JSON.parse(data.giftAllocation.allocations) : [],
            });
            setIsCheckoutOpen(true);
            resetForm();
            toast.success("Invoice generated and stock updated!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to generate invoice");
        }
    });

    const getProductPrice = (product: any, type: BillingType) => {
        return product.prices?.find((p: any) => p.billingType === type)?.price || 0;
    };

    const addToCart = (product: any) => {
        const price = getProductPrice(product, billingType);
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1, currentPrice: price }]);
        }
        toast.info(`${product.name} added`);
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const setQuantity = (id: string, value: string) => {
        const qty = parseInt(value);
        if (isNaN(qty)) return;
        setCart(cart.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, qty) };
            }
            return item;
        }));
    };

    const updatePrice = (id: string, value: string) => {
        const price = parseFloat(value);
        if (isNaN(price)) return;
        setCart(cart.map(item => {
            if (item.id === id) {
                return { ...item, currentPrice: Math.max(0, price) };
            }
            return item;
        }));
    };

    const handleBillingTypeChange = (type: BillingType) => {
        setBillingType(type);
        setCart(cart.map(item => ({
            ...item,
            currentPrice: getProductPrice(item, type)
        })));
    };

    const total = cart.reduce((acc, item) => acc + (item.currentPrice * item.quantity), 0);

    const tobaccoTotal = cart.reduce((acc, item) => {
        if (item.category?.isTobacco) return acc + (item.currentPrice * item.quantity);
        return acc;
    }, 0);

    const eligibleTotal = total - tobaccoTotal;

    const currentPaymentMode = activePaymentModes[0] || PaymentMode.CASH;
    const isCredit = activePaymentModes.includes(PaymentMode.CREDIT);
    
    let isEligiblePayment = false;
    let isEligibleBillingType = false;
    let isEligibleForRewards = false;

    if (rewardSettings) {
        const allowedPayments = (rewardSettings.allowedPaymentModes || '').split(',').map((p: string) => p.trim());
        const allowedTypes = (rewardSettings.allowedBillingTypes || '').split(',').map((t: string) => t.trim());
        
        isEligiblePayment = allowedPayments.includes(currentPaymentMode) && !isCredit;
        isEligibleBillingType = allowedTypes.includes(billingType);

        if (customerId && isEligiblePayment && isEligibleBillingType && eligibleTotal >= (rewardSettings.minEligibleAmount || 0)) {
            isEligibleForRewards = true;
        }
    }

    const { data: availableGifts = [] } = useQuery({
        queryKey: ["available-gifts", Math.floor(eligibleTotal)],
        queryFn: async () => {
            if (eligibleTotal <= 0) return [];
            return (await api.get(`/admin/rewards/gifts/available/${eligibleTotal}`)).data;
        },
        enabled: freeGiftsEnabled && isEligibleForRewards && eligibleTotal > 0,
    });

    // Automatic Direct Discount Logic
    let rewardDiscount = 0;
    if (couponEnabled && isEligibleForRewards) {
        rewardDiscount = Math.min(
            eligibleTotal * ((rewardSettings.discountPercent || 0) / 100),
            rewardSettings.discountCap || 0
        );
    }

    const netTotal = total - rewardDiscount;

    const totalReceived = (activePaymentModes.includes(PaymentMode.CASH) ? Number(receivedCash) || 0 : 0) +
        (activePaymentModes.includes(PaymentMode.UPI) ? Number(receivedUPI) || 0 : 0) +
        (activePaymentModes.includes(PaymentMode.CREDIT) ? Number(creditReceived) || 0 : 0);
    const balance = totalReceived - netTotal;



    // Auto-update single payment mode amount when netTotal changes
    useEffect(() => {
        if (activePaymentModes.length === 1 && netTotal > 0) {
            const mode = activePaymentModes[0];
            // Only auto-update if the current received amount is exactly the old netTotal,
            // or if we just want to strictly keep it in sync. Let's just strictly sync it 
            // so adding/removing items always keeps the balance at 0.
            if (mode === PaymentMode.CASH) setReceivedCash(netTotal);
            if (mode === PaymentMode.UPI) setReceivedUPI(netTotal);
            if (mode === PaymentMode.CREDIT) setCreditReceived(netTotal);
        }
    }, [netTotal]); // Deliberately only depending on netTotal to avoid overriding user input when they just toggle modes

    const handlePrintProforma = () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }
        // Logic for printing without saving
        setLastInvoice({
            id: "PROFORMA",
            total: netTotal,
            customer: customerName || "Walking Customer",
            date: new Date().toLocaleString(),
            paymentMode: "PRO-FORMA",
            couponDiscount: rewardDiscount,
            items: cart.map(item => ({ ...item })),
        });
        setTimeout(() => window.print(), 200);
    };

    const handleSaveDraft = useCallback(() => {
        if (cart.length === 0) return;

        const newDraft = {
            id: Date.now().toString(),
            customerName: customerName || "Walking Customer",
            customerId,
            billingType,
            items: [...cart],
            total: netTotal,
            timestamp: new Date().toISOString()
        };

        setDrafts(prev => [newDraft, ...prev]);
        toast.success("Draft saved successfully");
    }, [cart, customerName, customerId, billingType, netTotal]);

    const loadDraft = (draft: any) => {
        setCart(draft.items);
        setCustomerName(draft.customerName);
        setCustomerId(draft.customerId);
        setBillingType(draft.billingType);
        toast.success("Draft loaded");
    };

    const deleteDraft = (id: string) => {
        setDrafts(prev => prev.filter(d => d.id !== id));
        toast.info("Draft deleted");
    };

    const handleCompleteBilling = () => {
        if (cart.length === 0) return;
        if (paymentMode !== PaymentMode.CREDIT && totalReceived < netTotal) {
            toast.error(`Short by ₹${(netTotal - totalReceived).toFixed(2)}`);
            return;
        }

        const finalPaymentMode = activePaymentModes.length > 1
            ? PaymentMode.MIXED
            : activePaymentModes[0] || PaymentMode.CASH;

        const invoiceRequest = {
            items: cart.map(item => ({
                productId: item.id,
                unit: "Piece",
                quantity: item.quantity,
                price: item.currentPrice,
            })),
            totalAmount: total,
            billingType,
            netAmount: netTotal,
            paymentMode: finalPaymentMode,
            customerId,
            customerName: customerName || "Walking Customer",
            // For mixed payments, we could add split details if the backend supports it, 
            // but for now we follow the PaymentMode.MIXED enum
        };

        checkoutMutation.mutate(invoiceRequest);
    };

    const togglePaymentMode = (mode: PaymentMode) => {
        if (activePaymentModes.includes(mode)) {
            // Unchecking a mode: clear its value
            setActivePaymentModes(activePaymentModes.filter(m => m !== mode));
            if (mode === PaymentMode.CASH) setReceivedCash("");
            if (mode === PaymentMode.UPI) setReceivedUPI("");
            if (mode === PaymentMode.CREDIT) setCreditReceived("");
        } else {
            // Checking a mode
            setActivePaymentModes([...activePaymentModes, mode]);
            if (activePaymentModes.length === 0) {
                // First mode selected gets the full total
                if (mode === PaymentMode.CASH) setReceivedCash(netTotal);
                else if (mode === PaymentMode.UPI) setReceivedUPI(netTotal);
                else setCreditReceived(netTotal);
            } else {
                // Subsequent modes get the remaining balance (if any)
                const remaining = netTotal - totalReceived;
                const fillAmount = remaining > 0 ? remaining : "";
                if (mode === PaymentMode.CASH) setReceivedCash(fillAmount);
                else if (mode === PaymentMode.UPI) setReceivedUPI(fillAmount);
                else setCreditReceived(fillAmount);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // New Bill: Ctrl + Shift + N
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                if (cart.length > 0) {
                    handleSaveDraft();
                }
                resetForm();
                toast.success("New bill created");
            }
            // Add New Line: Ctrl + N
            else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                const input = document.getElementById('new-item-search');
                if (input) {
                    input.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart.length, handleSaveDraft, resetForm]);

    // Update onSuccess in mutation to clear payment states
    // (Note: Need to update the mutation definition above or just reset here if easier)

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full pb-4 print:hidden">
                <div className="lg:col-span-3 space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Billing Terminal</h2>
                                <p className="text-[10px] text-muted-foreground">Select products and pricing tier.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                                onClick={() => {
                                    if (cart.length > 0) handleSaveDraft();
                                    resetForm();
                                    toast.success("New bill created");
                                }}
                            >
                                <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                                New Bill
                            </Button>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                                    >
                                        <List className="mr-2 h-4 w-4 text-orange-500" />
                                        Drafts
                                        {drafts.length > 0 && (
                                            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 hover:bg-orange-600 border-none text-[10px]">
                                                {drafts.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-md p-4 pr-6 pt-2 gap-0">
                                    <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                            <List className="h-5 w-5 text-orange-500" />
                                            Saved Drafts
                                        </SheetTitle>
                                        <SheetDescription className="text-xs">
                                            Previously saved bills that haven't been finalized yet. Click the load button to restore them.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <ScrollArea className="h-[calc(100vh-160px)] pr-4 mt-2 -mr-4">
                                        <div className="space-y-2 py-2">
                                            {drafts.length === 0 ? (
                                                <div className="text-center py-20 opacity-40 space-y-2">
                                                    <List className="h-10 w-10 mx-auto text-slate-400" />
                                                    <p className="text-sm font-medium">No drafts found.</p>
                                                </div>
                                            ) : (
                                                drafts.map(draft => (
                                                    <div
                                                        key={draft.id}
                                                        className="group relative draftcard flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-orange-500/30 hover:bg-orange-50/10 dark:hover:bg-orange-950/5 transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                                                                    {draft.customerName}
                                                                </h4>
                                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full shrink-0">
                                                                    {draft.items.length} items
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 mt-1">
                                                                {new Date(draft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(draft.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono font-bold text-sm text-primary">₹{draft.total.toFixed(2)}</span>
                                                            <div className="flex items-center gap-1">
                                                                
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 rounded-xl"
                                                                    onClick={() => deleteDraft(draft.id)}
                                                                    title="Delete Draft"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            
                                                        </div>
                                                        <div className="loadList absolute inset-0 rounded-xl border-1 border-transparent group-hover:bg-orange-500 cursor-pointer group-hover:text-white" onClick={() => loadDraft(draft)} title="Load Draft" >
                                                            <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-white dark:hover:bg-orange-950/30 rounded-xl"
                                                                    onClick={() => loadDraft(draft)}
                                                                    title="Load Draft"
                                                                >
                                                                    <PlusCircle className="h-4.5 w-4.5 hover:bg-transparent" />
                                                            </Button> 
                                                            </div>
                                                        
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div className="flex items-center justify-end gap-2 w-full flex-1">
                            <CustomerSearchCell
                                item={customers.find((c: any) => c.id === customerId)}
                                customers={customers}
                                isCompactView={isCompactView}
                                onSelect={(cust) => {
                                    setCustomerId(cust.id);
                                    setCustomerName(cust.name);
                                    if (cust.id) {
                                        setBillingType(cust.type as BillingType);
                                    }
                                }}
                            />
                            <Select value={billingType} onValueChange={(v) => handleBillingTypeChange(v as BillingType)}>
                                <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 h-9 rounded-xl w-[130px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(BillingType).map(type => (
                                        <SelectItem key={type} value={type} className="capitalize">{type.replace('_', ' ').toLowerCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                                        <Plus className="h-4 w-4 mr-1 text-primary" /> New
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Add New Customer</DialogTitle>
                                        <DialogDescription>Quickly add a customer to this bill.</DialogDescription>
                                    </DialogHeader>
                                    <CustomerForm onSubmit={handleAddCustomer} loading={isCreatingCustomer} />
                                </DialogContent>
                            </Dialog>
                        </div>
                        {/* <div className="w-full md:w-64 space-y-1">
                            {/* <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Pricing Tier</label> *}

                    </div> */}
                    </div>

                    {/* Compact Top Row: Customer Selection & Price Type */}
                    {/* <Card className="border-none shadow-sm bg-indigo-50/30 dark:bg-slate-900/30 border border-indigo-100/50">
                        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-6">

                        </CardContent>
                    </Card> */}


                    <Card className="border-none shadow-md border border-slate-200/50 dark:border-slate-800/50 gap-0">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 py-0 px-4">
                            <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                                <ShoppingCart className="h-6 w-6 text-primary" />
                                Billing Cart
                            </CardTitle>
                            <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-4">{cart.length} items</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <TableRow className={isCompactView ? "h-8" : ""}>
                                        <TableHead className={`pl-6 ${isCompactView ? "py-1 text-[13px]" : ""}`}>Item Detail</TableHead>
                                        <TableHead className={isCompactView ? "py-1 text-[13px]" : ""}>Price</TableHead>
                                        <TableHead className={`text-center ${isCompactView ? "py-1 text-[13px]" : ""}`}>Quantity</TableHead>
                                        <TableHead className={isCompactView ? "py-1 text-[13px]" : ""}>Total</TableHead>
                                        <TableHead className={`text-right pr-6 ${isCompactView ? "py-1 text-[13px]" : ""}`}></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map((item, index) => (
                                        <TableRow key={`${item.id}-${index}`} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 ${isCompactView ? "h-10" : ""}`}>
                                            <TableCell className={`pl-6 ${isCompactView ? "py-1" : "py-4"}`}>
                                                <ProductSearchCell
                                                    item={item}
                                                    products={products}
                                                    billingType={billingType}
                                                    isCompactView={isCompactView}
                                                    onSelect={(product) => {
                                                        const price = getProductPrice(product, billingType);
                                                        setCart(cart.map((row, i) => i === index ? { ...product, quantity: row.quantity, currentPrice: price } : row));
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className={`font-mono ${isCompactView ? "text-xs px-1" : "text-sm"}`}>
                                                <div className="relative flex items-center">
                                                    <span className="absolute left-1 text-[10px] text-muted-foreground">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={item.currentPrice}
                                                        onChange={(e) => updatePrice(item.id, e.target.value)}
                                                        className={`bg-transparent border-none pl-4 pr-1 h-7 font-mono focus-visible:ring-1 focus-visible:ring-primary/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isCompactView ? "text-[11px] w-16" : "text-sm w-20"}`}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className={isCompactView ? "py-1" : ""}>
                                                <div className={`flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mx-auto ${isCompactView ? "p-0.5 w-20" : "p-1 w-24"}`}>
                                                    <Button variant="ghost" size="icon" className={`${isCompactView ? "h-5 w-5" : "h-6 w-6"} hover:bg-white dark:hover:bg-slate-700 shadow-sm`} onClick={() => updateQuantity(item.id, -1)}>
                                                        <Minus className={isCompactView ? "h-2 w-2" : "h-3 w-3"} />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => setQuantity(item.id, e.target.value)}
                                                        className={`bg-transparent border-none p-0 h-auto text-center font-bold focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isCompactView ? "text-xs w-8" : "text-sm w-10"}`}
                                                    />
                                                    <Button variant="ghost" size="icon" className={`${isCompactView ? "h-5 w-5" : "h-6 w-6"} hover:bg-white dark:hover:hover:bg-slate-700 shadow-sm`} onClick={() => updateQuantity(item.id, 1)}>
                                                        <Plus className={isCompactView ? "h-2 w-2" : "h-3 w-3"} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className={`font-bold text-primary font-mono ${isCompactView ? "text-sm" : ""}`}>₹{(item.currentPrice * item.quantity).toFixed(2)}</TableCell>
                                            <TableCell className={`text-right pr-6 ${isCompactView ? "py-1" : ""}`}>
                                                <Button variant="ghost" size="icon" className={`text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 dark:hover:bg-rose-950 ${isCompactView ? "h-7 w-7" : ""}`} onClick={() => setCart(cart.filter((_, i) => i !== index))}>
                                                    <Trash2 className={isCompactView ? "h-3.5 w-3.5" : "h-4 w-4"} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Always show Add Item Row */}
                                    <TableRow className="bg-primary/5 hover:bg-primary/10 transition-colors border-dashed border-t-2">
                                        <TableCell className="pl-6 py-2" colSpan={5}>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/20 p-1.5 rounded-lg">
                                                    <PlusCircle className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <ProductSearchCell
                                                        id="new-item-search"
                                                        products={products}
                                                        billingType={billingType}
                                                        isCompactView={isCompactView}
                                                        onSelect={(p) => addToCart(p)}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-4">
                                                    New Item Search
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {cart.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-16">
                                                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                    <ShoppingCart className="h-12 w-12 opacity-20" />
                                                    <p className="text-sm">Cart is empty. Use the search row above to add products.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className={`sticky top-2 border-none bg-blue-200 text-black shadow-2xl overflow-hidden group gap-1 rounded-2xl ${isCompactView ? "ring-1 ring-primary/20" : ""}`}>
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-white ${isCompactView ? "hidden" : ""}`}>
                            <Receipt className="h-24 w-24" />
                        </div>
                        <CardHeader className="relative py-0 gap-0 px-4 pb-0">
                            <div className="flex justify-between items-start ">
                                <div>
                                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-black-300 text-left">Total Bill</CardTitle>
                                    <div className={`font-bold font-mono text-black text-left ${isCompactView ? "text-2xl" : "text-3xl py-1"}`}>₹{netTotal.toFixed(2)}</div>
                                </div>
                                <div className="text-right">
                                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-black-300">Balance</CardTitle>
                                    <div className={`font-bold font-mono ${balance >= -0.01 ? "text-emerald-700" : "text-orange-600"} ${isCompactView ? "text-2xl" : "text-3xl py-1"}`}>
                                        ₹{Math.abs(balance).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className={`bg-white/5 space-y-3 ${isCompactView ? "py-2 px-4" : "py-4 px-4"}`}>
                            {/* Reward Discount Panel */}
                            {couponEnabled && !isCredit && (
                                <div className={`space-y-2 p-3 border rounded-xl ${rewardDiscount > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className={`h-3.5 w-3.5 ${rewardDiscount > 0 ? 'text-emerald-600' : 'text-slate-500'}`} />
                                        <label className={`text-[10px] uppercase font-bold tracking-widest cursor-pointer ${rewardDiscount > 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-500'}`}>
                                            Reward Discount
                                        </label>
                                    </div>
                                    {rewardDiscount > 0 ? (
                                        <p className="text-[9px] text-emerald-700/80 dark:text-emerald-400/80">
                                            You saved ₹{rewardDiscount.toFixed(2)} automatically with this order!
                                        </p>
                                    ) : !customerId ? (
                                        <p className="text-[9px] text-slate-500">Select a customer to check discount eligibility.</p>
                                    ) : !isEligibleBillingType ? (
                                        <p className="text-[9px] text-slate-500">Not eligible for current billing type ({billingType}).</p>
                                    ) : !isEligiblePayment ? (
                                        <p className="text-[9px] text-slate-500">Not eligible with current payment mode ({currentPaymentMode}).</p>
                                    ) : eligibleTotal < (rewardSettings?.minEligibleAmount || 0) ? (
                                        <p className="text-[9px] text-slate-500">Min. eligible amount of ₹{rewardSettings?.minEligibleAmount} not reached.</p>
                                    ) : (
                                        <p className="text-[9px] text-slate-500">Calculating...</p>
                                    )}
                                </div>
                            )}

                            {/* Free Gifts Panel */}
                            {freeGiftsEnabled && (
                                <div className={`space-y-2 p-3 border rounded-xl ${isEligibleForRewards && availableGifts.length > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                                    <div className="flex items-center gap-2">
                                        <Gift className={`h-3.5 w-3.5 ${isEligibleForRewards && availableGifts.length > 0 ? 'text-amber-600' : 'text-slate-500'}`} />
                                        <label className={`text-[10px] uppercase font-bold tracking-widest cursor-pointer ${isEligibleForRewards && availableGifts.length > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-slate-500'}`}>
                                            Free Gifts
                                        </label>
                                    </div>
                                    {isEligibleForRewards && availableGifts.length > 0 ? (
                                        <>
                                            <p className="text-[9px] text-amber-700/80 dark:text-amber-400/80">One of the following qualifying gifts will be randomly selected at checkout.</p>
                                            <div className="space-y-1.5 mt-1">
                                                {availableGifts.slice(0, 3).map((gift: any) => (
                                                    <div key={gift.id} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[11px] font-bold text-amber-900 truncate">{gift.name}</div>
                                                            <div className="text-[9px] text-amber-700/70">Value up to ₹{gift.maxValue?.toFixed(0) || 0}</div>
                                                        </div>
                                                        <Badge className="bg-amber-500 text-white border-none text-[8px] py-0 h-4 ml-2">
                                                            Free
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : !customerId ? (
                                        <p className="text-[9px] text-slate-500">Select a customer to check gift eligibility.</p>
                                    ) : !isEligibleBillingType ? (
                                        <p className="text-[9px] text-slate-500">Not eligible for current billing type ({billingType}).</p>
                                    ) : !isEligiblePayment ? (
                                        <p className="text-[9px] text-slate-500">Not eligible with current payment mode ({currentPaymentMode}).</p>
                                    ) : eligibleTotal < (rewardSettings?.minEligibleAmount || 0) ? (
                                        <p className="text-[9px] text-slate-500">Min. eligible amount of ₹{rewardSettings?.minEligibleAmount} not reached.</p>
                                    ) : (
                                        <p className="text-[9px] text-slate-500">No gifts available for this amount.</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Payment Selection</label>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {/* Cash Payment */}
                                    <div className={`px-2 py-2 h-10 items-center rounded-xl border transition-all ${activePaymentModes.includes(PaymentMode.CASH) ? 'bg-white/10 border-blue-500/50' : 'bg-white/50 opacity-60 border-blue-500/50'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="pay-cash"
                                                    checked={activePaymentModes.includes(PaymentMode.CASH)}
                                                    onCheckedChange={() => togglePaymentMode(PaymentMode.CASH)}
                                                    className="border-slate-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 h-3.5 w-3.5"
                                                />
                                                <label htmlFor="pay-cash" className="text-[14px] font-bold flex items-center gap-1.5 cursor-pointer">
                                                    <Banknote className="h-4 w-4" /> Cash
                                                </label>
                                            </div>
                                            {activePaymentModes.includes(PaymentMode.CASH) && (
                                                <div className="relative">
                                                    <span className="absolute left-1.5 top-1.5 text-[9px] text-slate-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="h-7 pl-4 bg-emerald-500/10 border-emerald-500/30 text-black font-mono text-xs rounded-lg w-20"
                                                        value={receivedCash}
                                                        onChange={(e) => setReceivedCash(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                            {activePaymentModes.includes(PaymentMode.CASH) && (
                                                <Button variant="ghost" size="sm" className="h-4 text-[8px] text-emerald-950 p-0 hover:bg-transparent" onClick={() => setReceivedCash(netTotal)}>Full Pay</Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* UPI Payment */}
                                    <div className={`p-2 rounded-xl border transition-all ${activePaymentModes.includes(PaymentMode.UPI) ? 'bg-white/10 border-blue-500/50' : 'bg-white/50 opacity-60 border-blue-500/50'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="pay-upi"
                                                    checked={activePaymentModes.includes(PaymentMode.UPI)}
                                                    onCheckedChange={() => togglePaymentMode(PaymentMode.UPI)}
                                                    className="border-slate-500 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 h-3.5 w-3.5"
                                                />
                                                <label htmlFor="pay-upi" className="text-[12px] font-bold flex items-center gap-1.5 cursor-pointer">
                                                    <Wallet className="h-4 w-4" /> UPI
                                                </label>
                                            </div>
                                            {activePaymentModes.includes(PaymentMode.UPI) && (
                                                <div className="relative">
                                                    <span className="absolute left-1.5 top-1.5 text-[9px] text-slate-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="h-7 pl-4 bg-slate-950/10 border-indigo-500/30 text-black font-mono text-xs rounded-lg w-20"
                                                        value={receivedUPI}
                                                        onChange={(e) => setReceivedUPI(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                            {activePaymentModes.includes(PaymentMode.UPI) && (
                                                <Button variant="ghost" size="sm" className="h-4 text-[8px] text-indigo-950 p-0 hover:bg-transparent" onClick={() => setReceivedUPI(netTotal)}>Full Pay</Button>
                                            )}
                                        </div>

                                    </div>

                                    {/* Credit Payment */}
                                    <div className={`p-2 rounded-xl border transition-all ${activePaymentModes.includes(PaymentMode.CREDIT) ? 'bg-white/10 border-blue-500/50' : 'bg-white/50 opacity-60 border-blue-500/50'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="pay-credit"
                                                    checked={activePaymentModes.includes(PaymentMode.CREDIT)}
                                                    onCheckedChange={() => togglePaymentMode(PaymentMode.CREDIT)}
                                                    className="border-slate-500 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 h-3.5 w-3.5"
                                                />
                                                <label htmlFor="pay-credit" className="text-[12px] font-bold flex items-center gap-1.5 cursor-pointer">
                                                    <CheckCircle2 className="h-4 w-4" /> Credit
                                                </label>
                                            </div>
                                            {activePaymentModes.includes(PaymentMode.CREDIT) && (
                                                <div className="relative">
                                                    <span className="absolute left-1.5 top-1.5 text-[9px] text-slate-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="h-7 pl-4 bg-slate-950/10 border-rose-500/30 text-black font-mono text-xs rounded-lg w-20"
                                                        value={creditReceived}
                                                        onChange={(e) => setCreditReceived(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                            {activePaymentModes.includes(PaymentMode.CREDIT) && (
                                                <Button variant="ghost" size="sm" className="h-4 text-[8px] text-rose-950 p-0 hover:bg-transparent" onClick={() => setCreditReceived(netTotal)}>Full Credit</Button>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-black">Bill Summary</label>
                                <div className="space-y-1 rounded-xl bg-slate-100/50 p-2 border border-blue-500/50" style={{ margin: '0 -0.1rem' }}>
                                    <div className="flex justify-between text-[11px] text-slate-900">
                                        <span>Subtotal</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-900">
                                        <span className="flex items-center gap-1">
                                            Tobacco
                                            <Badge variant="outline" className="text-[8px] h-3 px-1 border-rose-500/30 text-rose-400">₹{tobaccoTotal.toFixed(2)}</Badge>
                                        </span>
                                        <span className="text-[10px] text-slate-700">Excl.</span>
                                    </div>
                                    {rewardDiscount > 0 && (
                                        <div className="flex justify-between text-[11px] font-bold text-emerald-400">
                                            <span>Direct Discount</span>
                                            <span>-₹{rewardDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {freeGiftsEnabled && isEligibleForRewards && availableGifts.length > 0 && !isCredit && (
                                        <div className="flex justify-between text-[11px] font-bold text-amber-500">
                                            <span>Free Gifts</span>
                                            <span>Eligible!</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm font-bold text-black pt-1 border-t border-slate-800 mt-1">
                                        <span>Net Total</span>
                                        <span className="text-primary">₹{netTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div >

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-2 shadow-2xl z-50 flex flex-col md:flex-row items-center justify-between gap-3 print:hidden" >
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-500 text-left">Cart Total</span>
                        <span className="text-xl font-black text-primary tracking-tighter">₹{netTotal.toFixed(2)}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-500 text-left">Items</span>
                        <span className="text-xs font-bold">{cart.length} Products</span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-500 text-left">Status</span>
                        <Badge variant={balance >= -0.01 || activePaymentModes.includes(PaymentMode.CREDIT) ? "secondary" : "destructive"} className="font-bold text-[10px] h-4 py-0">
                            {balance >= -0.01 ? "Paid" : activePaymentModes.includes(PaymentMode.CREDIT) ? "Credit" : `Short ₹${Math.abs(balance).toFixed(2)}`}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none h-9 px-4 rounded-xl font-bold border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-xs"
                        onClick={handleSaveDraft}
                        disabled={cart.length === 0}
                    >
                        <LayoutGrid className="mr-1.5 h-3.5 w-3.5" /> Save
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none h-9 px-4 rounded-xl font-bold border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-xs"
                        onClick={handlePrintProforma}
                        disabled={cart.length === 0}
                    >
                        <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                    </Button>
                    <Button
                        className="flex-[2] md:flex-none h-11 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl rounded-xl group active:scale-[0.98] transition-all text-base"
                        disabled={cart.length === 0 || (!activePaymentModes.includes(PaymentMode.CREDIT) && balance < -0.01)}
                        onClick={handleCompleteBilling}
                    >
                        <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Final Bill
                    </Button>
                </div>
            </div>

            {/* Checkout Success Modal */}
            < Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} >
                <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="flex flex-col items-center text-center p-8">
                        <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-900 shadow-sm shadow-emerald-200/20">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Billing Successful!</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                            Invoice <span className="font-mono font-bold text-primary tracking-tighter">{lastInvoice?.id}</span> created.
                        </DialogDescription>



                        <div className="w-full mt-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-left">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Collected Amount</span>
                                <span className="font-bold text-xl text-slate-900 dark:text-slate-50">₹{lastInvoice?.total.toFixed(2)}</span>
                            </div>
                            {lastInvoice?.couponDiscount > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-emerald-500 font-bold">Reward Discount</span>
                                            <span className="font-bold text-emerald-500">-₹{lastInvoice?.couponDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {lastInvoice?.giftAllocations && lastInvoice.giftAllocations.length > 0 && (
                                        <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-2 mt-2">
                                            <span className="text-amber-500 font-bold text-xs uppercase tracking-wider block mb-1">Free Gifts Allocated</span>
                                            <div className="space-y-1">
                                                {lastInvoice.giftAllocations.map((gift: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs text-amber-600 dark:text-amber-400">
                                                        <span>{gift.quantity}x {gift.productName}</span>
                                                        <span>Free</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">Payment</span>
                                <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none px-3 font-bold">{lastInvoice?.paymentMode}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">Customer</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{lastInvoice?.customer}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400 font-mono">
                                {lastInvoice?.date}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                        <Button variant="outline" className="w-full h-12 rounded-xl font-semibold border-slate-200 dark:border-slate-700" onClick={() => { setIsCheckoutOpen(false); setLastInvoice(null); }}>
                            New Bill
                        </Button>
                        <Button className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20" onClick={() => {
                            setTimeout(() => window.print(), 100);
                        }}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Hidden Receipt for Thermal Printing */}
            < div className="hidden print:block print:fixed print:top-0 print:left-0 print:w-[80mm] print:bg-white print:text-black print:p-4 print:font-mono print:text-[12px] leading-tight" >
                <div className="text-center border-b border-dashed border-black pb-2 mb-2">
                    <h1 className="text-lg font-bold uppercase">SV Store</h1>
                    <p>opp. Sri Sai Hospital, Guestine, Attibele</p>
                    <p>Tel: +91 9206116029</p>
                </div>

                <div className="mb-2 text-[10px]">
                    <p>INV: {lastInvoice?.id}</p>
                    <p>DATE: {lastInvoice?.date}</p>
                    <p>CUST: {lastInvoice?.customer}</p>
                </div>

                <div className="border-b border-dashed border-black mb-2 pb-1">
                    <div className="flex justify-between font-bold border-b border-black mb-1 pb-1">
                        <span>Items</span>
                        <span>Total</span>
                    </div>
                    {(lastInvoice?.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between mb-1">
                            <div className="flex-1 pr-2">
                                <div>{item.shortCode || item.name}</div>
                                <div className="text-[10px]">{item.quantity} x {item.currentPrice}</div>
                            </div>
                            <div className="font-bold">₹{(item.quantity * item.currentPrice).toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                <div className="space-y-1 text-sm border-t border-dashed border-black pt-1">
                    <div className="flex justify-between font-bold">
                        <span>NET TOTAL</span>
                        <span>₹{lastInvoice?.total?.toFixed(2)}</span>
                    </div>
                    {lastInvoice?.couponDiscount > 0 && (
                        <div className="flex justify-between text-[10px]">
                            <span>REWARD DISCOUNT</span>
                            <span>-₹{lastInvoice?.couponDiscount?.toFixed(2)}</span>
                        </div>
                    )}
                    {lastInvoice?.giftAllocations && lastInvoice.giftAllocations.length > 0 && (
                        <div className="pt-1 mt-1 border-t border-dashed border-black">
                            <span className="font-bold">FREE GIFTS:</span>
                            {lastInvoice.giftAllocations.map((gift: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[10px]">
                                    <span>{gift.quantity}x {gift.productName}</span>
                                    <span>FREE</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between text-[10px]">
                        <span>PAYMENT</span>
                        <span>{lastInvoice?.paymentMode}</span>
                    </div>
                </div>



                <div className="text-center mt-6 pt-4 border-t border-dashed border-black">
                    <p className="font-bold uppercase tracking-widest text-[10px]">THANK YOU!</p>
                    <p className="text-[8px]">Please visit again</p>
                </div>
            </div >
        </>
    );
}
