'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ArrowLeft, Edit } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import { GET_INVOICE, GET_CUSTOMERS, GET_CUSTOMER_LOCATIONS, GET_PRODUCTS } from '@/graphql/queries';
import {
    UPDATE_INVOICE,
    CREATE_INVOICE_ITEM,
    UPDATE_INVOICE_ITEM,
    DELETE_INVOICE_ITEM
} from '@/graphql/mutations';
import { Invoice, InvoiceItem } from '@/types';

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const invoiceSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    locationId: z.string().optional(),
    invoiceNo: z.string().min(1, 'Invoice number is required'),
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    discount: z.string().optional(),
    status: z.string(),
});

const itemSchema = z.object({
    productId: z.string().min(1, 'Product is required'),
    serialNo: z.string().optional(),
    quantity: z.string().min(1, 'Quantity is required'),
    amount: z.string().min(1, 'Amount is required'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;
type ItemFormValues = z.infer<typeof itemSchema>;

export default function InvoiceDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = parseInt(params.id as string);

    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const { data, loading, refetch } = useQuery(GET_INVOICE, {
        variables: { id: invoiceId },
    });

    const { data: customersData } = useQuery(GET_CUSTOMERS, {
        variables: { page: 1, limit: 1000 },
    });

    const { data: locationsData } = useQuery(GET_CUSTOMER_LOCATIONS, {
        variables: {
            page: 1,
            limit: 1000,
            customerId: selectedCustomerId || undefined,
        },
        skip: !selectedCustomerId,
    });

    const { data: productsData } = useQuery(GET_PRODUCTS, {
        variables: { page: 1, limit: 1000 },
    });

    const [updateInvoice, { loading: updatingInvoice }] = useMutation(UPDATE_INVOICE);
    const [createItem, { loading: creatingItem }] = useMutation(CREATE_INVOICE_ITEM);
    const [updateItem, { loading: updatingItem }] = useMutation(UPDATE_INVOICE_ITEM);
    const [deleteItem, { loading: deletingItem }] = useMutation(DELETE_INVOICE_ITEM);

    const invoiceForm = useForm<InvoiceFormValues>({
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

    const itemForm = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            productId: '',
            serialNo: '',
            quantity: '1',
            amount: '0',
        },
    });

    const invoice: Invoice | undefined = (data as any)?.invoice;
    const items: InvoiceItem[] = invoice?.items || [];
    const customers = (customersData as any)?.customers?.data || [];
    const locations = (locationsData as any)?.customerLocations?.data || [];
    const products = (productsData as any)?.products?.data || [];

    // Watch customerId to fetch locations
    const watchCustomerId = invoiceForm.watch('customerId');
    useEffect(() => {
        if (watchCustomerId) {
            setSelectedCustomerId(parseInt(watchCustomerId));
            invoiceForm.setValue('locationId', '');
        }
    }, [watchCustomerId, invoiceForm]);

    const handleEditInvoice = () => {
        if (!invoice) return;
        setSelectedCustomerId(invoice.customerId);
        invoiceForm.reset({
            customerId: invoice.customerId.toString(),
            locationId: invoice.locationId?.toString() || '',
            invoiceNo: invoice.invoiceNo,
            invoiceDate: invoice.invoiceDate.split('T')[0],
            discount: invoice.discount.toString(),
            status: invoice.status,
        });
        setIsInvoiceDialogOpen(true);
    };

    const handleAddItem = () => {
        setSelectedItem(null);
        itemForm.reset({
            productId: '',
            serialNo: '',
            quantity: '1',
            amount: '0',
        });
        setIsItemDialogOpen(true);
    };

    const handleEditItem = (item: InvoiceItem) => {
        setSelectedItem(item);
        itemForm.reset({
            productId: item.productId.toString(),
            serialNo: item.serialNo || '',
            quantity: item.quantity.toString(),
            amount: item.amount.toString(),
        });
        setIsItemDialogOpen(true);
    };

    const handleDeleteItem = (item: InvoiceItem) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };

    const onInvoiceSubmit = async (values: InvoiceFormValues) => {
        try {
            const input = {
                customerId: parseInt(values.customerId),
                locationId: values.locationId ? parseInt(values.locationId) : undefined,
                invoiceNo: values.invoiceNo,
                invoiceDate: values.invoiceDate,
                discount: parseFloat(values.discount || '0'),
                status: values.status,
            };

            await updateInvoice({
                variables: {
                    id: invoiceId,
                    input,
                },
            });
            toast.success('Invoice updated successfully');
            setIsInvoiceDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const onItemSubmit = async (values: ItemFormValues) => {
        try {
            const input = {
                productId: parseInt(values.productId),
                serialNo: values.serialNo || undefined,
                quantity: parseInt(values.quantity),
                amount: parseFloat(values.amount),
            };

            if (selectedItem) {
                await updateItem({
                    variables: {
                        id: selectedItem.id,
                        input,
                    },
                });
                toast.success('Item updated successfully');
            } else {
                await createItem({
                    variables: {
                        invoiceId,
                        input,
                    },
                });
                toast.success('Item added successfully');
            }
            setIsItemDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const confirmDeleteItem = async () => {
        if (!selectedItem) return;
        try {
            await deleteItem({
                variables: {
                    id: selectedItem.id,
                },
            });
            toast.success('Item deleted successfully');
            setIsDeleteDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.push('/invoices')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Invoices
                </Button>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Invoice not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push('/invoices')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Invoices
                </Button>
            </div>

            {/* Invoice Information Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Invoice {invoice.invoiceNo}</CardTitle>
                            <CardDescription>Invoice Details</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={invoice.status === 'active' ? 'default' : 'secondary'}>
                                {invoice.status}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={handleEditInvoice}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Invoice
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                <p className="text-sm font-semibold">{invoice.customer?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <p className="text-sm">{invoice.location?.displayName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Invoice Date</p>
                                <p className="text-sm">{formatDate(invoice.invoiceDate)}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total:</span>
                                <span className="text-sm font-medium">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Discount:</span>
                                <span className="text-sm font-medium text-red-600">-{formatCurrency(invoice.discount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Subtotal:</span>
                                <span className="text-sm font-medium">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-base font-semibold">Grand Total:</span>
                                <span className="text-base font-bold text-primary">{formatCurrency(invoice.grandTotal)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invoice Items Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Invoice Items</CardTitle>
                            <CardDescription>Manage invoice items</CardDescription>
                        </div>
                        <Button onClick={handleAddItem}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {items.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No items found. Add an item to get started.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Serial No</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.product?.name || '-'}
                                            {item.product?.model && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    ({item.product.model})
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{item.serialNo || '-'}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(item.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditItem(item)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteItem(item)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Invoice Dialog */}
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Invoice</DialogTitle>
                        <DialogDescription>Update the invoice information</DialogDescription>
                    </DialogHeader>
                    <Form {...invoiceForm}>
                        <form onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={invoiceForm.control}
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
                                    control={invoiceForm.control}
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
                                    control={invoiceForm.control}
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
                                    control={invoiceForm.control}
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
                                    control={invoiceForm.control}
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
                                    control={invoiceForm.control}
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
                                    onClick={() => setIsInvoiceDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updatingInvoice}>
                                    {updatingInvoice ? 'Saving...' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Item Dialog */}
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedItem ? 'Edit Item' : 'Add Item'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedItem
                                ? 'Update the item information'
                                : 'Add a new item to this invoice'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...itemForm}>
                        <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4">
                            <FormField
                                control={itemForm.control}
                                name="productId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map((product: any) => (
                                                    <SelectItem key={product.id} value={product.id.toString()}>
                                                        {product.name} {product.model && `(${product.model})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={itemForm.control}
                                name="serialNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Serial Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Serial number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={itemForm.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" placeholder="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={itemForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsItemDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creatingItem || updatingItem}>
                                    {creatingItem || updatingItem ? 'Saving...' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Item Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this item? This action cannot be undone.
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
                            onClick={confirmDeleteItem}
                            disabled={deletingItem}
                        >
                            {deletingItem ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
