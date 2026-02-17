import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  ChevronDown, 
  Receipt, 
  CreditCard, 
  FileCheck, 
  Package, 
  Truck, 
  Wallet, 
  BadgeIndianRupee,
  X,
  Copy,
  UserMinus,
  UserCheck,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format } from "date-fns";

export default function CustomerProfilePage() {
    const { user, token } = useAuthStore();
    const { toast } = useToast();
    const [isFetchLoading, setIsFetchLoading] = useState(true);
    const [customer, setCustomer] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const [comments, setComments] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [mails, setMails] = useState<any[]>([]);
    const [statementTransactions, setStatementTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/flow/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) {
                        setCustomer(data.data);
                        
                        // Fetch related data for tabs
                        const [txRes, mailRes, invRes, commentsRes] = await Promise.all([
                            fetch(`/api/customers/${data.data.id}/transactions`),
                            fetch(`/api/customers/${data.data.id}/mails`),
                            fetch("/api/invoices"),
                            fetch(`/api/customers/${data.data.id}/comments`)
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

                        if (commentsRes.ok) {
                            const commentsData = await commentsRes.json();
                            setComments(commentsData.data || []);
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

    const formatAddress = (address: any) => {
        if (!address) return ['-'];
        const parts = [address.street, address.city, address.state, address.country, address.pincode].filter(Boolean);
        return parts.length > 0 ? parts : ['-'];
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (isFetchLoading) {
        return <div className="container mx-auto py-10 text-center">Loading profile...</div>;
    }

    if (!customer) {
        return <div className="container mx-auto py-10 text-center">Profile not found.</div>;
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-sidebar-accent/5">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-sidebar font-display truncate">{customer.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        Edit
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-sidebar hover:bg-sidebar/90 text-white gap-1.5 h-9 font-display shadow-sm" size="sm">
                                New Transaction
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-xs text-slate-500">SALES</DropdownMenuLabel>
                            <DropdownMenuItem><Receipt className="mr-2 h-4 w-4" /> Invoice</DropdownMenuItem>
                            <DropdownMenuItem><CreditCard className="mr-2 h-4 w-4" /> Customer Payment</DropdownMenuItem>
                            <DropdownMenuItem><FileCheck className="mr-2 h-4 w-4" /> Quote</DropdownMenuItem>
                            <DropdownMenuItem><Package className="mr-2 h-4 w-4" /> Sales Order</DropdownMenuItem>
                            <DropdownMenuItem><Truck className="mr-2 h-4 w-4" /> Delivery Challan</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem><Wallet className="mr-2 h-4 w-4" /> Expense</DropdownMenuItem>
                            <DropdownMenuItem><BadgeIndianRupee className="mr-2 h-4 w-4" /> Credit Note</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center px-6 border-b border-slate-200 bg-white flex-shrink-0">
                    <TabsList className="h-auto p-0 bg-transparent gap-8">
                        {["overview", "comments", "transactions", "mails", "statement"].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-sidebar data-[state=active]:text-sidebar data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-3 bg-transparent hover:bg-transparent transition-none font-medium font-display capitalize"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <TabsContent value="overview" className="m-0 p-0">
                        <div className="flex h-full">
                            <div className="w-72 border-r border-slate-200 p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">{customer.name}</h3>
                                        <p className="text-sm text-sidebar font-medium mt-1">{customer.email}</p>
                                    </div>
                                    <Collapsible defaultOpen>
                                        <CollapsibleTrigger className="flex items-center justify-between w-full text-[11px] font-bold text-sidebar/60 uppercase tracking-widest">
                                            ADDRESS
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4 space-y-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Billing Address</p>
                                                <div className="text-sm">{formatAddress(customer.billingAddress).map((l:any, i:any) => <p key={i}>{l}</p>)}</div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Shipping Address</p>
                                                <div className="text-sm">{formatAddress(customer.shippingAddress).map((l:any, i:any) => <p key={i}>{l}</p>)}</div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            </div>
                            <div className="flex-1 p-6">
                                <div className="max-w-4xl">
                                    <div className="mb-8">
                                        <h4 className="text-lg font-semibold mb-4 text-sidebar">Receivables</h4>
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr className="text-left border-b border-slate-200">
                                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase">CURRENCY</th>
                                                        <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase">OUTSTANDING RECEIVABLES</th>
                                                        <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase">UNUSED CREDITS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">INR- Indian Rupee</td>
                                                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(customer.outstandingReceivables || 0)}</td>
                                                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(customer.unusedCredits || 0)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="comments" className="m-0 p-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <Textarea placeholder="Add a comment..." className="min-h-[100px]" />
                                    <div className="flex justify-end">
                                        <Button size="sm">Add Comment</Button>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                        {comments.length === 0 ? (
                                            <p className="text-slate-500 py-6 text-center italic">No comments available.</p>
                                        ) : (
                                            comments.map((c: any) => (
                                                <div key={c.id} className="py-3 border-b border-slate-50 last:border-0">
                                                    <p className="text-sm text-slate-700">{c.text}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">{format(new Date(c.createdAt), "MMM d, yyyy h:mm a")} by {c.author}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transactions" className="m-0 p-6">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="font-bold">Number</TableHead>
                                    <TableHead className="font-bold text-right">Amount</TableHead>
                                    <TableHead className="font-bold text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-20 text-slate-400 italic">No transactions found.</TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx: any) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>{format(new Date(tx.date), "MMM d, yyyy")}</TableCell>
                                            <TableCell>{tx.invoiceNumber || tx.number}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(tx.total || tx.amount)}</TableCell>
                                            <TableCell className="text-right">{tx.status}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="mails" className="m-0 p-6 text-center text-slate-500 italic">
                        {mails.length === 0 ? "No mail history found." : "Mail history content here."}
                    </TabsContent>

                    <TabsContent value="statement" className="m-0 p-6 text-center text-slate-500 italic">
                        Account statement will be generated here.
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
