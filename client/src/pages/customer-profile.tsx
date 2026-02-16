
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AppShell from "@/components/layout/AppShell";

import { CustomerForm, CustomerFormValues } from "@/modules/sales/components/CustomerForm";

export default function CustomerProfilePage() {
    const { user, token } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchLoading, setIsFetchLoading] = useState(true);
    const [profileData, setProfileData] = useState<Partial<CustomerFormValues>>({});

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
        <div className="container mx-auto py-10">
            <Card className="max-w-3xl mx-auto border-slate-200 shadow-lg">
                <CardHeader className="bg-slate-50 border-b mb-6">
                    <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
                    <CardDescription>Update your business or personal details</CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomerForm
                        initialData={profileData}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
