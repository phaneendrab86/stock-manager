"use client";

import * as React from "react";
import {
    LayoutDashboard,
    Package,
    ReceiptText,
    WalletCards,
    Users,
    Settings,
    LogOut,
    Package2,
    ChevronRight,
    TrendingUp,
    FileText,
    Building2,
    Gift,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useAuth } from "@/components/auth-provider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Inventory",
        url: "/inventory",
        icon: Package,
        items: [
            { title: "Products", url: "/inventory/products" },
            { title: "Categories", url: "/inventory/categories" },
            { title: "Units", url: "/inventory/units" },
            { title: "Stock History", url: "/inventory/history" },
            { title: "Stock Purchasing", url: "/inventory/purchases" },
        ],
    },
    {
        title: "Billing",
        url: "/billing",
        icon: ReceiptText,
        items: [
            { title: "New Bill (POS)", url: "/billing" },
            { title: "Invoice History", url: "/billing/history" },
        ],
    },
    {
        title: "Partners",
        url: "/partners",
        icon: Building2,
        items: [
            { title: "Distributors", url: "/inventory/distributors" },
            { title: "Customers", url: "/customers" },
            { title: "Visit Tracking", url: "/visits" },
        ],
    },
    {
        title: "Expenses",
        url: "/expenses",
        icon: WalletCards,
    },
    {
        title: "Analytics",
        url: "/analytics",
        icon: TrendingUp,
    },
    {
        title: "Reports",
        url: "/reports",
        icon: FileText,
        items: [
            { title: "Sales Report", url: "/reports/sales" },
            { title: "Inventory Report", url: "/reports/inventory" },
            { title: "Expense Report", url: "/reports/expenses" },
            { title: "Profit & Loss", url: "/reports/profit-loss" },
        ],
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["ADMIN"],
        items: [
            { title: "User Management", url: "/settings/users" },
            { title: "System Settings", url: "/settings/system" },
            { title: "Reward Management", url: "/settings/rewards" },
            { title: "Reminders", url: "/settings/reminders" },
            { title: "Audit Trail", url: "/settings/audit-logs" },
        ],
    },
];

export function AppSidebar() {
    const { user, activeRole, logout, switchRole } = useAuth();
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" className="border-r border-zinc-200 dark:border-zinc-800">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Package2 className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Smart Stock</span>
                                    <span className="text-xs text-muted-foreground">v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="z-10">
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map((item) => {
                            if (item.roles && !item.roles.some(role => user?.roles?.some((r: any) => r.name === role))) {
                                return null;
                            }

                            if (item.items) {
                                return (
                                    <Collapsible key={item.title} asChild className="group/collapsible">
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.title}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                                <Link href={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    {user?.roles?.length > 1 && (
                        <SidebarMenuItem>
                            <Collapsible className="w-full">
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip="Switch Role">
                                        <Settings className="size-4" />
                                        <span>Active: {activeRole?.name}</span>
                                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {user.roles.map((role: any) => (
                                            <SidebarMenuSubItem key={role.id}>
                                                <SidebarMenuSubButton
                                                    onClick={() => switchRole(role.id)}
                                                    isActive={activeRole?.id === role.id}
                                                >
                                                    <span className="truncate">{role.name}</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={logout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <LogOut />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
