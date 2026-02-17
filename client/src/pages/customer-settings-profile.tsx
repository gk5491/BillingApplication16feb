import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CustomerForm, CustomerFormValues } from "@/modules/sales/components/CustomerForm";

export default function CustomerSettingsProfilePage() {
    const { token } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchLoading, setIsFetchLoading] = useState(true);
    const [profileData, setProfileData] = useState<Partial<CustomerFormValues>>({});

    useEffect(() => {
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
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Personal Details</h1>
                <p className="text-slate-500 font-display">Update your contact and business information</p>
            </div>
            <Card className="max-w-4xl border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-lg font-bold">Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
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
