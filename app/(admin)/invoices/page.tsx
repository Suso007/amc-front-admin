'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { GET_INVOICES, GET_CUSTOMERS, GET_CUSTOMER_LOCATIONS } from '@/graphql/queries';
import { CREATE_INVOICE, UPDATE_INVOICE, DELETE_INVOICE } from '@/graphql/mutations';
import { Invoice } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const invoiceSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    locationId: z.string().optional(),
    invoiceNo: z.string().min(1, 'Invoice number is required'),
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    discount: z.string().optional(),
    status: z.string(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function InvoicesPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const { data, loading, refetch } = useQuery(GET_INVOICES, {
        variables: {
            page,
            limit: 10,
            search: search || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
        },
    });

    const { data: customersData } = useQuery(GET_CUSTOMERS, {
        variables: { page: 1, limit: 1000 },
    });

    const { data: locationsData, loading: locationsLoading } = useQuery(GET_CUSTOMER_LOCATIONS, {
        variables: {
            page: 1,
            limit: 1000,
            customerId: selectedCustomerId || undefined,
        },
        skip: !selectedCustomerId,
    });

    const [createInvoice, { loading: creating }] = useMutation(CREATE_INVOICE);
    const [updateInvoice, { loading: updating }] = useMutation(UPDATE_INVOICE);
    const [deleteInvoice, { loading: deleting }] = useMutation(DELETE_INVOICE);

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            customerId: '',
            locationId: '',
            invoiceNo: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            discount: '0',
            status: 'active',
        },
    });

    const customers = (customersData as any)?.customers?.data || [];
    const locations = (locationsData as any)?.customerLocations?.data || [];

    // Watch customerId to fetch locations
    const watchCustomerId = form.watch('customerId');
    useEffect(() => {
        if (watchCustomerId) {
            setSelectedCustomerId(parseInt(watchCustomerId));
            form.setValue('locationId', '');
        }
    }, [watchCustomerId, form]);

    const handleAdd = () => {
        setSelectedInvoice(null);
        setSelectedCustomerId(null);
        form.reset({
            customerId: '',
            locationId: '',
            invoiceNo: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            discount: '0',
            status: 'active',
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setSelectedCustomerId(invoice.customerId);
        form.reset({
            customerId: invoice.customerId.toString(),
            locationId: invoice.locationId?.toString() || '',
            invoiceNo: invoice.invoiceNo,
            invoiceDate: invoice.invoiceDate.split('T')[0],
            discount: invoice.discount.toString(),
            status: invoice.status,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsDeleteDialogOpen(true);
    };

    const handleViewDetails = (invoiceId: number) => {
        router.push(`/invoices/${invoiceId}`);
    };

    const onSubmit = async (values: InvoiceFormValues) => {
        try {
            const input = {
                customerId: parseInt(values.customerId),
                locationId: values.locationId ? parseInt(values.locationId) : undefined,
                invoiceNo: values.invoiceNo,
                invoiceDate: values.invoiceDate,
                total: 0,
                discount: parseFloat(values.discount || '0'),
                subtotal: 0,
                grandTotal: 0,
                status: values.status,
            };

            if (selectedInvoice) {
                await updateInvoice({
                    variables: {
                        id: selectedInvoice.id,
                        input,
                    },
                });
                toast.success('Invoice updated successfully');
            } else {
                await createInvoice({
                    variables: {
                        input,
                    },
                });
                toast.success('Invoice created successfully');
            }
            setIsDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const confirmDelete = async () => {
        if (!selectedInvoice) return;
        try {
            await deleteInvoice({
                variables: {
                    id: selectedInvoice.id,
                },
            });
            toast.success('Invoice deleted successfully');
            setIsDeleteDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const invoices = (data as any)?.invoices?.data || [];
    const pagination = (data as any)?.invoices?.pagination;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage invoices and invoice items
                    </p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Invoice
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1 md:max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search invoices..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice No</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Invoice Date</TableHead>
                                        <TableHead className="text-right">Grand Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice: Invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                                            <TableCell>{invoice.customer?.name || '-'}</TableCell>
                                            <TableCell>{invoice.location?.displayName || '-'}</TableCell>
                                            <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(invoice.grandTotal)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={invoice.status === 'active' ? 'default' : 'secondary'}>
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewDetails(invoice.id)}
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(invoice)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(invoice)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {invoices.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    No invoices found
                                </p>
                            )}

                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === pagination.totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="min-w-5xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedInvoice ? 'Edit Invoice' : 'Add Invoice'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedInvoice
                                ? 'Update the invoice information'
                                : 'Create a new invoice'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="invoiceNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Invoice Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="INV-001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="invoiceDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Invoice Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select customer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {customers.map((customer: any) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="locationId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location (Optional)</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!selectedCustomerId}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select location" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {locations.length === 0 && locationsLoading === false && <SelectItem value="none">None</SelectItem>}
                                                    {locationsLoading && <SelectItem value="loading">Loading...</SelectItem>}
                                                    {locations.map((location: any) => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.displayName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="discount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating || updating}>
                                    {creating || updating ? 'Saving...' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Invoice</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete invoice "{selectedInvoice?.invoiceNo}"? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
