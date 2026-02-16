
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { CustomerForm, CustomerFormValues } from "@/modules/sales/components/CustomerForm";

export default function CustomerProfilePage() {
    const { user, token } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchLoading, setIsFetchLoading] = useState(true);
    const [profileData, setProfileData] = useState<Partial<CustomerFormValues>>({});

    const [activeTab, setActiveTab] = useState("overview");

    const [transactions, setTransactions] = useState<any[]>([]);
    const [mails, setMails] = useState<any[]>([]);
    const [statementTransactions, setStatementTransactions] = useState<any[]>([]);

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
                        
                        // Fetch related data for tabs
                        const [txRes, mailRes, invRes] = await Promise.all([
                            fetch(`/api/customers/${data.data.id}/transactions`),
                            fetch(`/api/customers/${data.data.id}/mails`),
                            fetch("/api/invoices")
                        ]);
                        
                        if (txRes.ok) {
                            const txData = await txRes.json();
                            setTransactions(txData.data?.invoices || []);
                        }
                        
                        if (mailRes.ok) {
                            const mailData = await mailRes.json();
                            setMails(mailData.data || []);
                        }

                        if (invRes.ok) {
                            const invData = await invRes.json();
                            const filteredInvoices = (invData.data || []).filter((inv: any) => inv.customerId === data.data.id);
                            setStatementTransactions(filteredInvoices);
                        }
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold font-display">Comments</h3>
                        </div>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <Textarea 
                                        placeholder="Add a comment..." 
                                        className="min-h-[100px] bg-slate-50 border-slate-200 focus:border-blue-400"
                                    />
                                    <div className="flex justify-end">
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold font-display">
                                            Add Comment
                                        </Button>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                        <p className="text-slate-500 py-6 text-center italic">No comments available for your account.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="transactions">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold font-display">Transaction History</h3>
                        </div>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Date</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Type</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Number</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-right">Amount</TableHead>
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-display italic">
                                                Transaction history will be displayed here.
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="mails">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold font-display">Sent Mails</h3>
                        </div>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="pt-6">
                                <p className="text-slate-500 py-10 text-center italic">No mail history found.</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="statement">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold font-display">Account Statement</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="font-bold font-display">Download PDF</Button>
                                <Button variant="outline" size="sm" className="font-bold font-display">Print</Button>
                            </div>
                        </div>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="pt-6">
                                <p className="text-slate-500 py-10 text-center italic font-display">Your account statement will be generated here.</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
