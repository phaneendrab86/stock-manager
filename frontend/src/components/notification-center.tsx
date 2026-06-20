"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Clock, Info, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const { data: notifications, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const { data } = await api.get("/notifications");
            return data as any[];
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const clearAllMutation = useMutation({
        mutationFn: async () => {
            return api.delete("/notifications");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300">
                    <Bell className="h-[1.2rem] w-[1.2rem] text-slate-500 dark:text-slate-400" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center border-2 border-white dark:border-slate-950">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-none shadow-2xl rounded-3xl bg-white dark:bg-slate-950 mr-4 mt-2 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800" align="end">
                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900">
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-tight">Alert Center</h4>
                        <p className="text-[10px] text-slate-400 font-medium">You have {unreadCount} unread messages</p>
                    </div>
                    {notifications && notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            onClick={() => clearAllMutation.mutate()}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear All
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-80">
                    {notifications?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3 opacity-40 py-20">
                            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-xs font-semibold text-slate-400">Your signal is quiet. No notifications found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-900/50">
                            {notifications?.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 flex gap-3 transition-colors group relative",
                                        !notification.isRead ? "bg-indigo-50/30 dark:bg-indigo-950/10" : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                    )}
                                >
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                                        !notification.isRead ? "bg-indigo-100 border-indigo-200 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-800" : "bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                                    )}>
                                        <Info className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1 pr-6 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={cn("text-xs font-bold leading-none capitalize", !notification.isRead ? "text-slate-900 dark:text-slate-100" : "text-slate-500")}>
                                                {notification.title}
                                            </p>
                                        </div>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-1 text-[9px] text-slate-300 font-bold uppercase tracking-widest pt-1">
                                            <Clock className="h-2 w-2" />
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsReadMutation.mutate(notification.id)}
                                            className="absolute right-4 top-4 h-5 w-5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110 active:scale-95"
                                        >
                                            <Check className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-900 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-500">
                        View All Activity
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
