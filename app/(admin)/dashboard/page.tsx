'use client';

import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileText, Package, Tag } from 'lucide-react';
import { GET_CUSTOMERS, GET_INVOICES, GET_PRODUCTS, GET_BRANDS } from '@/graphql/queries';

export default function DashboardPage() {
    const { data: customersData, loading: customersLoading } = useQuery(GET_CUSTOMERS, {
        variables: { page: 1, limit: 1 },
    });

    const { data: invoicesData, loading: invoicesLoading } = useQuery(GET_INVOICES, {
        variables: { page: 1, limit: 10 },
    });

    const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS, {
        variables: { page: 1, limit: 1 },
    });

    const { data: brandsData, loading: brandsLoading } = useQuery(GET_BRANDS, {
        variables: { page: 1, limit: 1 },
    });

    const stats = [
        {
            title: 'Total Customers',
            value: (customersData as any)?.customers?.pagination?.total || 0,
            icon: Users,
            loading: customersLoading,
        },
        {
            title: 'Total Invoices',
            value: (invoicesData as any)?.invoices?.pagination?.total || 0,
            icon: FileText,
            loading: invoicesLoading,
        },
        {
            title: 'Total Products',
            value: (productsData as any)?.products?.pagination?.total || 0,
            icon: Package,
            loading: productsLoading,
        },
        {
            title: 'Total Brands',
            value: (brandsData as any)?.brands?.pagination?.total || 0,
            icon: Tag,
            loading: brandsLoading,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Welcome to the AMC Management System
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {stat.loading ? (
                                <Skeleton className="h-8 w-20" />
                            ) : (
                                <div className="text-2xl font-bold">{stat.value}</div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Invoices */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    {invoicesLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(invoicesData as any)?.invoices?.data?.slice(0, 5).map((invoice: any) => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between border-b pb-3 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{invoice.invoiceNo}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {invoice.customer?.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₹{invoice.grandTotal}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!(invoicesData as any)?.invoices?.data || (invoicesData as any).invoices.data.length === 0) && (
                                <p className="text-center text-muted-foreground py-8">
                                    No invoices found
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
