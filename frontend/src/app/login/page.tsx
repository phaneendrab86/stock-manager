"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Package2, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast.success("Login successful!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-primary p-2 rounded-lg">
                    <Package2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Smart Stock</h1>
            </div>
            <p>User Name : admin@smartstock.com</p>
            <p> pwd : admin123</p>
            <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 shadow-xl animate-in zoom-in-95 duration-500">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-zinc-50 dark:bg-zinc-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-zinc-50 dark:bg-zinc-900"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="mt-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <p className="mt-8 text-sm text-muted-foreground text-center">
                &copy; 2026 Smart Stock Systems. All rights reserved.
            </p>
        </div>
    );
}
