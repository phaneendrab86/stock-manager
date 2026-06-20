"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, Search, UserCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function UsersPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        roleIds: [] as string[],
    });

    const queryClient = useQueryClient();

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                return (await api.get("/users")).data as any[];
            } catch (e) {
                return [
                    { id: "mock-1", name: "Admin User", email: "admin@smartstock.com", isActive: true, roles: [{ id: "1", name: "ADMIN" }] },
                    { id: "mock-2", name: "Staff Member", email: "staff@example.com", isActive: true, roles: [{ id: "2", name: "BILLING_STAFF" }] },
                ];
            }
        },
    });

    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            try {
                return (await api.get("/users/roles")).data as any[];
            } catch (e) {
                return [
                    { id: "1", name: "ADMIN" },
                    { id: "2", name: "BILLING_STAFF" },
                    { id: "3", name: "MANAGER" },
                ];
            }
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post("/users", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User created successfully");
            closeDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create user");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User updated successfully");
            closeDialog();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update user");
        },
    });

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", roleIds: [] });
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "", // Don't show password
            roleIds: user.roles.map((r: any) => r.id),
        });
        setIsDialogOpen(true);
    };

    const handleRoleToggle = (roleId: string) => {
        const newRoleIds = formData.roleIds.includes(roleId)
            ? formData.roleIds.filter(id => id !== roleId)
            : [...formData.roleIds, roleId];
        setFormData({ ...formData, roleIds: newRoleIds });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            const { password, ...updateData } = formData;
            const dataToSubmit = password ? formData : updateData;
            updateMutation.mutate({ id: editingUser.id, data: dataToSubmit });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredUsers = users?.filter((u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Identity & Access</h2>
                    <p className="text-muted-foreground text-sm">Manage staff roles and platform permissions.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingUser(null)} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" />
                            Provision New User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
                        <form onSubmit={handleSubmit}>
                            <div className="p-8">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">{editingUser ? "Configure User" : "Provision User"}</DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                        Establish secure access for your team members.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Full Name</Label>
                                        <Input
                                            id="name"
                                            className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Professional Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{editingUser ? "Rotate Password (Optional)" : "Security Password"}</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Assigned Privileges</Label>
                                        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                                            {roles?.length ? (
                                                roles.map((role: any) => (
                                                    <div key={role.id} className="flex items-center space-x-2.5">
                                                        <Checkbox
                                                            id={`role-${role.id}`}
                                                            className="rounded-md border-slate-300 dark:border-slate-700"
                                                            checked={formData.roleIds.includes(role.id)}
                                                            onCheckedChange={() => handleRoleToggle(role.id)}
                                                        />
                                                        <Label htmlFor={`role-${role.id}`} className="font-semibold text-slate-600 dark:text-slate-400 capitalize text-xs cursor-pointer">
                                                            {role.name.toLowerCase().replace('_', ' ')}
                                                        </Label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-center text-[10px] text-slate-400 italic">No roles available</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 px-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <Button type="button" variant="ghost" className="rounded-xl h-11 px-6 font-semibold" onClick={closeDialog}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="rounded-xl h-11 px-8 font-semibold shadow-lg shadow-primary/20" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingUser ? "Apply Changes" : "Provision User"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 h-10 border-none bg-white dark:bg-slate-950 shadow-sm rounded-xl focus-visible:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest">User Profile</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Assigned Roles</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Security Status</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                        <p className="text-xs font-medium text-slate-400">Authenticating user directory...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <UserCircle className="h-10 w-10 opacity-10" />
                                        <p className="text-sm">Found no users in registry.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers?.map((user: any) => (
                                <TableRow key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-indigo-950/30 flex items-center justify-center border border-slate-200 dark:border-indigo-900/50 shadow-inner">
                                                <UserCircle className="h-6 w-6 text-slate-400 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.roles.map((role: any) => (
                                                <Badge key={role.id} variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 capitalize text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                    <ShieldCheck className="h-3 w-3 mr-1 text-indigo-500/70" />
                                                    {role.name.toLowerCase().replace('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                                            <Badge variant="ghost" className={`text-[10px] font-bold uppercase tracking-tight p-0 dark:hover:bg-transparent ${user.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                                {user.isActive ? "Authorized" : "Revoked"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-white border-slate-200/50 shadow-sm" onClick={() => handleEdit(user)}>
                                                <Pencil className="h-4 w-4 text-slate-600" />
                                            </Button>
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
