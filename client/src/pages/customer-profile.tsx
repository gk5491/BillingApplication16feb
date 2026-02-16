
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AppShell from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CustomerForm, CustomerFormValues } from "@/modules/sales/components/CustomerForm";

export default function CustomerProfilePage() {
    const { user, token } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchLoading, setIsFetchLoading] = useState(true);
    const [profileData, setProfileData] = useState<Partial<CustomerFormValues>>({});

    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        // Fetch existing profile if available
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/flow/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) {
                        setProfileData(data.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setIsFetchLoading(false);
            }
        };

        if (token) fetchProfile();
        else setIsFetchLoading(false);
    }, [token]);


    const onSubmit = async (data: CustomerFormValues) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/flow/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to update profile");

            toast({
                title: "Success",
                description: "Profile updated successfully"
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchLoading) {
        return <div className="container mx-auto py-10 text-center">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">My Profile</h1>
                        <p className="text-slate-500 font-display">Manage your personal and business details</p>
                    </div>
                    <TabsList className="bg-slate-100/50 border border-slate-200">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold font-display text-xs uppercase tracking-wider">Overview</TabsTrigger>
                        <TabsTrigger value="comments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold font-display text-xs uppercase tracking-wider">Comments</TabsTrigger>
                        <TabsTrigger value="transactions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold font-display text-xs uppercase tracking-wider">Transactions</TabsTrigger>
                        <TabsTrigger value="mails" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold font-display text-xs uppercase tracking-wider">Mails</TabsTrigger>
                        <TabsTrigger value="statement" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold font-display text-xs uppercase tracking-wider">Statement</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview">
                    <Card className="max-w-4xl border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg font-bold">Personal Details</CardTitle>
                            <CardDescription>Update your contact and business information</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <CustomerForm
                                initialData={profileData}
                                onSubmit={onSubmit}
                                isLoading={isLoading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="comments">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Comments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 py-10 text-center italic">No comments available for your account.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 py-10 text-center italic">Transaction history will be displayed here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="mails">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Mails</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 py-10 text-center italic">No mail history found.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statement">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Statement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 py-10 text-center italic">Your account statement will be generated here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
