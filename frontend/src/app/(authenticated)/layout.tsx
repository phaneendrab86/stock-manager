"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useAuth } from "@/components/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { NotificationCenter } from "@/components/notification-center";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, activeRole, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Generate dynamic breadcrumbs based on pathname
    // const segments = pathname.split("/").filter(Boolean); // This is now handled by DynamicBreadcrumbs component

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset className="bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 capitalize">
                                        {pathname.split("/").filter(Boolean).pop()?.replace(/-/g, ' ') || 'Overview'}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{activeRole?.name || user.roles?.[0]?.name}</span>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="p-2 md:p-4 lg:p-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
