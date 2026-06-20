"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, History as HistoryIcon, Clock, Calendar, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function RemindersPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        frequency: "DAILY",
        nextRun: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });

    const { data: reminders, isLoading } = useQuery({
        queryKey: ["reminders"],
        queryFn: async () => {
            const { data } = await api.get("/reminders");
            return data as any[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post("/reminders", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            setIsCreateOpen(false);
            setFormData({
                title: "",
                description: "",
                frequency: "DAILY",
                nextRun: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            });
            toast.success("Reminder established successfully.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/reminders/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            toast.success("Reminder terminated.");
        },
    });

    const getFrequencyBadge = (freq: string) => {
        const colors: Record<string, string> = {
            DAILY: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
            WEEKLY: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50",
            MONTHLY: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
            YEARLY: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
            ALT_DAYS: "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50",
        };
        return (
            <Badge variant="outline" className={`${colors[freq] || "bg-slate-50 text-slate-600"} uppercase text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md`}>
                {freq.replace("_", " ")}
            </Badge>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                        Automated Reminders
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">Configure and manage recurring business signals and operation alerts.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl px-5 h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all group">
                            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                            Establish Reminder
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800">
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Setup New Signal</DialogTitle>
                            <DialogDescription className="text-slate-500 text-xs font-medium mt-1">
                                Define frequency and trigger time for this business reminder.
                            </DialogDescription>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Signal Title</Label>
                                <Input
                                    placeholder="e.g. Weekly Inventory Audit"
                                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Context/Description</Label>
                                <Input
                                    placeholder="Provide more details about this task..."
                                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Frequency</Label>
                                    <Select
                                        value={formData.frequency}
                                        onValueChange={(v) => setFormData({ ...formData, frequency: v })}
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="ALT_DAYS">Alternative Days</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="YEARLY">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">First Execution</Label>
                                    <Input
                                        type="datetime-local"
                                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                        value={formData.nextRun}
                                        onChange={(e) => setFormData({ ...formData, nextRun: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                                disabled={createMutation.isPending || !formData.title}
                                onClick={() => createMutation.mutate(formData)}
                            >
                                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Deploy Signal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 rounded-3xl">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                            <TableHead className="pl-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Reminder Detail</TableHead>
                            <TableHead className="py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Frequency</TableHead>
                            <TableHead className="py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Next Scheduled</TableHead>
                            <TableHead className="text-right pr-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Signal Registers...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : reminders?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-24">
                                    <div className="flex flex-col items-center gap-4 opacity-40">
                                        <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Bell className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900 dark:text-slate-100">No active signals found</p>
                                            <p className="text-xs font-medium text-slate-500">Establish your first automated business reminder to stay synchronized.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            reminders?.map((reminder: any) => (
                                <TableRow key={reminder.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors border-b border-slate-50 dark:border-slate-900/50">
                                    <TableCell className="pl-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                                                <HistoryIcon className="h-5 w-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{reminder.title}</div>
                                                <div className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] mt-0.5">{reminder.description || "No description provided."}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getFrequencyBadge(reminder.frequency)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {reminder.isActive ? (
                                                <>
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Paused</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
                                                {format(new Date(reminder.nextRun), "MMM d, yyyy")}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-medium">
                                                at {format(new Date(reminder.nextRun), "HH:mm")}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500"
                                                onClick={() => deleteMutation.mutate(reminder.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl">
                    <div className="flex flex-col gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm uppercase tracking-tight">Real-time Signals</h4>
                            <p className="text-xs text-slate-500 font-medium">Automatic background processing ensures your signals are never delayed.</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl">
                    <div className="flex flex-col gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm uppercase tracking-tight">Multi-Frequency</h4>
                            <p className="text-xs text-slate-500 font-medium">Support for daily, alternate days, weekly, and custom lifecycle patterns.</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl">
                    <div className="flex flex-col gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm uppercase tracking-tight">System Reliability</h4>
                            <p className="text-xs text-slate-500 font-medium">Persistent state ensures reminders trigger accurately even after server reboots.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
