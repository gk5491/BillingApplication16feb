import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const INDIAN_STATES = [
    { code: "01", name: "Jammu and Kashmir" },
    { code: "02", name: "Himachal Pradesh" },
    { code: "03", name: "Punjab" },
    { code: "04", name: "Chandigarh" },
    { code: "05", name: "Uttarakhand" },
    { code: "06", name: "Haryana" },
    { code: "07", name: "Delhi" },
    { code: "08", name: "Rajasthan" },
    { code: "09", name: "Uttar Pradesh" },
    { code: "10", name: "Bihar" },
    { code: "11", name: "Sikkim" },
    { code: "12", name: "Arunachal Pradesh" },
    { code: "13", name: "Nagaland" },
    { code: "14", name: "Manipur" },
    { code: "15", name: "Mizoram" },
    { code: "16", name: "Tripura" },
    { code: "17", name: "Meghalaya" },
    { code: "18", name: "Assam" },
    { code: "19", name: "West Bengal" },
    { code: "20", name: "Jharkhand" },
    { code: "21", name: "Odisha" },
    { code: "22", name: "Chhattisgarh" },
    { code: "23", name: "Madhya Pradesh" },
    { code: "24", name: "Gujarat" },
    { code: "25", name: "Daman and Diu (Old)" },
    { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
    { code: "27", name: "Maharashtra" },
    { code: "28", name: "Andhra Pradesh (Old)" },
    { code: "29", name: "Karnataka" },
    { code: "30", name: "Goa" },
    { code: "31", name: "Lakshadweep" },
    { code: "32", name: "Kerala" },
    { code: "33", name: "Tamil Nadu" },
    { code: "34", name: "Puducherry" },
    { code: "35", name: "Andaman and Nicobar Islands" },
    { code: "36", name: "Telangana" },
    { code: "37", name: "Andhra Pradesh" },
    { code: "38", name: "Ladakh" },
    { code: "97", name: "Other Territory" },
];

export const GST_TREATMENTS = [
    { value: "registered_regular", label: "Registered Business \u2013 Regular" },
    { value: "registered_composition", label: "Registered Business \u2013 Composition" },
    { value: "unregistered_business", label: "Unregistered Business" },
    { value: "consumer", label: "Consumer" },
    { value: "overseas", label: "Overseas" },
    { value: "sez_unit", label: "Special Economic Zone (SEZ Unit)" },
];

export const customerSchema = z.object({
    customerType: z.enum(["business", "individual"]),
    name: z.string().min(1, "Name is required"),
    companyName: z.string().optional(),
    email: z.string().email("Invalid email").or(z.literal("")),
    phone: z.string().optional(),
    gstin: z.string().optional(),
    gstTreatment: z.string().optional(),
    placeOfSupply: z.string().optional(),
    billingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        pincode: z.string().optional(),
    }),
    shippingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        pincode: z.string().optional(),
    }),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    initialData?: Partial<CustomerFormValues>;
    onSubmit: (data: CustomerFormValues) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    isAdmin?: boolean;
}

export function CustomerForm({ initialData, onSubmit, onCancel, isLoading, isAdmin }: CustomerFormProps) {
    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            customerType: initialData?.customerType || "business",
            name: initialData?.name || "",
            companyName: initialData?.companyName || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            gstin: initialData?.gstin || "",
            gstTreatment: initialData?.gstTreatment || "registered_regular",
            placeOfSupply: initialData?.placeOfSupply || "27",
            billingAddress: initialData?.billingAddress || { street: "", city: "", state: "", country: "India", pincode: "" },
            shippingAddress: initialData?.shippingAddress || initialData?.billingAddress || { street: "", city: "", state: "", country: "India", pincode: "" },
        },
    });

    const copyBillingToShipping = () => {
        form.setValue("shippingAddress", form.getValues("billingAddress"));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="gst">GST Details</TabsTrigger>
                        <TabsTrigger value="address">Address</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="customerType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Customer Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-row space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="business" /></FormControl>
                                                <FormLabel className="font-normal">Business</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="individual" /></FormControl>
                                                <FormLabel className="font-normal">Individual</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input type="email" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="gst" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="gstTreatment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GST Treatment</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select treatment" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {GST_TREATMENTS.map(t => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="gstin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GSTIN</FormLabel>
                                        <FormControl><Input {...field} placeholder="27AAGCA4900Q1ZE" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="placeOfSupply"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Place of Supply</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {INDIAN_STATES.map(s => (
                                                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="address" className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Billing Address</h3>
                                <Button type="button" variant="ghost" size="sm" onClick={copyBillingToShipping} className="text-xs text-blue-600">
                                    Copy to Shipping
                                </Button>
                            </div>
                            <FormField
                                control={form.control}
                                name="billingAddress.street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="billingAddress.city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="billingAddress.pincode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pincode</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Shipping Address</h3>
                            <FormField
                                control={form.control}
                                name="shippingAddress.street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="shippingAddress.city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="shippingAddress.pincode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pincode</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Customer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
