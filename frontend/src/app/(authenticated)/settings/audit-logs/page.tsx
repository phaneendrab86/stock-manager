"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, History, User, Activity, Clock, Download } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { downloadCSV } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AuditLogsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: logs, isLoading } = useQuery({
        queryKey: ["audit-logs"],
        queryFn: async () => {
            const { data } = await api.get("/audit-logs");
            return data as any[];
        },
    });

    const handleExport = () => {
        if (!logs) return;
        const exportData = logs.map(log => ({
            "Timestamp": format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
            "Operator": log.user?.name || "System",
            "Email": log.user?.email || "-",
            "Action": log.action.replace(/_/g, " "),
            "Details": log.details || ""
        }));
        downloadCSV(exportData, `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Audit trail exported!");
    };

    const filteredLogs = logs?.filter((log: any) =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getActionBadge = (action: string) => {
        const colorClass = action.includes("CREATE") ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50" :
            action.includes("UPDATE") || action.includes("ADJUST") ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50" :
                "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50";

        return (
            <Badge variant="outline" className={`${colorClass} uppercase text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md`}>
                {action.replace(/_/g, " ")}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Audit Trail</h2>
                    <p className="text-muted-foreground text-sm">Comprehensive ledger of all administrative and inventory actions.</p>
                </div>
                <Button variant="outline" className="h-10 rounded-xl" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Ledger
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by action, operator, or details..."
                            className="pl-10 h-10 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 rounded-3xl">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                            <TableHead className="py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Operator</TableHead>
                            <TableHead className="py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Action Type</TableHead>
                            <TableHead className="py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Activity Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Accessing ledger archives...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <History className="h-10 w-10 opacity-10" />
                                        <p className="text-sm">No activity records discovered.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLogs?.map((log: any) => (
                                <TableRow key={log.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-50 dark:border-slate-900/50">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                                    {format(new Date(log.createdAt), "HH:mm:ss")}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium">
                                                    {format(new Date(log.createdAt), "MMM d, yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                                <User className="h-4 w-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">{log.user?.name}</div>
                                                <div className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">{log.user?.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getActionBadge(log.action)}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                {log.details || "-"}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
