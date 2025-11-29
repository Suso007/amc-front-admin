'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2, RefreshCw, FileText, Mail, ExternalLink, FileStack, Inbox } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import {
    GET_AMC_PROPOSAL,
    GET_CUSTOMER_LOCATIONS,
    GET_INVOICES,
    GET_INVOICE,
    GET_PROPOSAL_DOCUMENTS,
    GET_EMAIL_RECORDS
} from '@/graphql/queries';
import {
    CREATE_PROPOSAL_ITEM,
    UPDATE_PROPOSAL_ITEM,
    DELETE_PROPOSAL_ITEM,
    UPDATE_AMC_PROPOSAL,
    GENERATE_PROPOSAL_DOCUMENT,
    SEND_PROPOSAL_EMAIL
} from '@/graphql/mutations';
import { ProposalItem } from '@/types';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const proposalItemSchema = z.object({
    locationId: z.string().optional(),
    invoiceId: z.string().min(1, 'Invoice is required'),
    productId: z.string().min(1, 'Product is required'),
    serialno: z.string().optional(),
    saccode: z.string().optional(),
    quantity: z.string().min(1, 'Quantity is required'),
    rate: z.string().min(1, 'Rate is required'),
    amount: z.string().min(1, 'Amount is required'),
});

type ProposalItemFormValues = z.infer<typeof proposalItemSchema>;

const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'sent', label: 'Sent' },
    { value: 'pending', label: 'Pending' },
    { value: 'on process', label: 'On Process' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'paymentdue', label: 'Payment Due' },
    { value: 'paid', label: 'Paid' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'on renew', label: 'On Renew' },
];

export default function ProposalDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const proposalId = parseInt(params.id as string);

    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [isDocumentsDrawerOpen, setIsDocumentsDrawerOpen] = useState(false);
    const [isEmailRecordsDrawerOpen, setIsEmailRecordsDrawerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ProposalItem | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [emailRecipient, setEmailRecipient] = useState('');
    const [emailMessage, setEmailMessage] = useState('');

    const { data, loading, refetch } = useQuery(GET_AMC_PROPOSAL, {
        variables: { id: proposalId },
    });

    const { data: locationsData } = useQuery(GET_CUSTOMER_LOCATIONS, {
        variables: {
            page: 1,
            limit: 1000,
            customerId: (data as any)?.amcProposal?.customerId,
        },
        skip: !(data as any)?.amcProposal?.customerId,
    });

    const { data: invoicesData } = useQuery(GET_INVOICES, {
        variables: {
            page: 1,
            limit: 1000,
            customerId: (data as any)?.amcProposal?.customerId,
        },
        skip: !(data as any)?.amcProposal?.customerId,
    });

    const { data: selectedInvoiceData } = useQuery(GET_INVOICE, {
        variables: { id: selectedInvoiceId },
        skip: !selectedInvoiceId,
    });

    const [createItem, { loading: creatingItem }] = useMutation(CREATE_PROPOSAL_ITEM);
    const [updateItem, { loading: updatingItem }] = useMutation(UPDATE_PROPOSAL_ITEM);
    const [deleteItem, { loading: deletingItem }] = useMutation(DELETE_PROPOSAL_ITEM);
    const [updateProposal] = useMutation(UPDATE_AMC_PROPOSAL);
    const [generateDocument, { loading: generatingDocument }] = useMutation(GENERATE_PROPOSAL_DOCUMENT);
    const [sendEmail, { loading: sendingEmail }] = useMutation(SEND_PROPOSAL_EMAIL);

    const form = useForm<ProposalItemFormValues>({
        resolver: zodResolver(proposalItemSchema),
        defaultValues: {
            locationId: '',
            invoiceId: '',
            productId: '',
            serialno: '',
            saccode: '',
            quantity: '1',
            rate: '0',
            amount: '0',
        },
    });

    const proposal = (data as any)?.amcProposal;
    const locations = (locationsData as any)?.customerLocations?.data || [];
    const invoices = (invoicesData as any)?.invoices?.data || [];
    const invoiceItems = (selectedInvoiceData as any)?.invoice?.items || [];

    const { data: documentsData, refetch: refetchDocuments } = useQuery(GET_PROPOSAL_DOCUMENTS, {
        variables: {
            page: 1,
            limit: 100,
            proposalno: proposal?.proposalno,
        },
        skip: !proposal?.proposalno,
    });

    const { data: emailRecordsData, refetch: refetchEmailRecords } = useQuery(GET_EMAIL_RECORDS, {
        variables: {
            page: 1,
            limit: 100,
            proposalno: proposal?.proposalno,
        },
        skip: !proposal?.proposalno,
    });

    const documents = (documentsData as any)?.proposalDocuments?.data || [];
    const emailRecords = (emailRecordsData as any)?.emailRecords?.data || [];

    // Watch for quantity and rate changes to calculate amount
    const watchQuantity = form.watch('quantity');
    const watchRate = form.watch('rate');

    useEffect(() => {
        const quantity = parseFloat(watchQuantity || '0');
        const rate = parseFloat(watchRate || '0');
        const amount = quantity * rate;
        form.setValue('amount', amount.toFixed(2));
    }, [watchQuantity, watchRate, form]);

    // Watch for product selection to auto-fill serial number
    const watchProductId = form.watch('productId');

    useEffect(() => {
        if (watchProductId && invoiceItems.length > 0) {
            const selectedProduct = invoiceItems.find((item: any) => item.productId === parseInt(watchProductId));
            if (selectedProduct?.serialNo) {
                form.setValue('serialno', selectedProduct.serialNo);
            }
        }
    }, [watchProductId, invoiceItems, form]);

    // Watch for location change to filter invoices
    const watchLocationId = form.watch('locationId');

    useEffect(() => {
        if (watchLocationId) {
            setSelectedLocationId(parseInt(watchLocationId));
        } else {
            setSelectedLocationId(null);
        }
    }, [watchLocationId]);

    // Watch for invoice selection
    const watchInvoiceId = form.watch('invoiceId');

    useEffect(() => {
        if (watchInvoiceId) {
            setSelectedInvoiceId(parseInt(watchInvoiceId));
        } else {
            setSelectedInvoiceId(null);
        }
    }, [watchInvoiceId]);

    // Filter invoices by location if selected
    const filteredInvoices = selectedLocationId
        ? invoices.filter((inv: any) => inv.locationId === selectedLocationId)
        : invoices;

    const handleAddItem = () => {
        setSelectedItem(null);
        form.reset({
            locationId: '',
            invoiceId: '',
            productId: '',
            serialno: '',
            saccode: '',
            quantity: '1',
            rate: '0',
            amount: '0',
        });
        setIsItemDialogOpen(true);
    };

    const handleEditItem = (item: ProposalItem) => {
        setSelectedItem(item);
        setSelectedInvoiceId(item.invoiceId);
        form.reset({
            locationId: item.locationId?.toString() || '',
            invoiceId: item.invoiceId.toString(),
            productId: item.productId.toString(),
            serialno: item.serialno || '',
            saccode: item.saccode || '',
            quantity: item.quantity.toString(),
            rate: item.rate.toString(),
            amount: item.amount.toString(),
        });
        setIsItemDialogOpen(true);
    };

    const handleDeleteItem = (item: ProposalItem) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };

    const onSubmitItem = async (values: ProposalItemFormValues) => {
        try {
            const input = {
                locationId: values.locationId ? parseInt(values.locationId) : undefined,
                invoiceId: parseInt(values.invoiceId),
                productId: parseInt(values.productId),
                serialno: values.serialno || undefined,
                saccode: values.saccode || undefined,
                quantity: parseInt(values.quantity),
                rate: parseFloat(values.rate),
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
                        proposalId,
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

    const handleGenerateDocument = async () => {
        try {
            const result = await generateDocument({
                variables: {
                    proposalId,
                },
            });
            toast.success('Proposal document generated successfully!');
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate document');
        }
    };

    const handleOpenEmailDialog = () => {
        setEmailRecipient(proposal?.customer?.email || '');
        setEmailMessage('');
        setIsEmailDialogOpen(true);
    };

    const handleSendEmail = async () => {
        try {
            await sendEmail({
                variables: {
                    input: {
                        proposalId,
                        email: emailRecipient,
                        message: emailMessage || undefined,
                    },
                },
            });
            toast.success('Email sent successfully!');
            setIsEmailDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'Failed to send email');
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateProposal({
                variables: {
                    id: proposalId,
                    input: {
                        proposalstatus: newStatus,
                    },
                },
            });
            toast.success('Status updated successfully');
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
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-muted-foreground">Proposal not found</p>
                <Button className="mt-4" onClick={() => router.push('/amc-proposals')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Proposals
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/amc-proposals')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            Proposal {proposal.proposalno}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {proposal.customer?.name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsDocumentsDrawerOpen(true)}
                    >
                        <FileStack className="mr-2 h-4 w-4" />
                        View Documents
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsEmailRecordsDrawerOpen(true)}
                    >
                        <Inbox className="mr-2 h-4 w-4" />
                        Email Records
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleGenerateDocument}
                        disabled={generatingDocument}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        {generatingDocument ? 'Generating...' : 'Generate Proposal'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleOpenEmailDialog}
                        disabled={!proposal.doclink || sendingEmail}
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                    </Button>
                    <Select value={proposal.proposalstatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Proposal Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Proposal Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Proposal Date</p>
                            <p className="font-medium">{formatDate(proposal.proposaldate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">AMC Start Date</p>
                            <p className="font-medium">{formatDate(proposal.amcstartdate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">AMC End Date</p>
                            <p className="font-medium">{formatDate(proposal.amcenddate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Contract Number</p>
                            <p className="font-medium">{proposal.contractno || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Billing Address</p>
                            <p className="font-medium">{proposal.billingaddress || '-'}</p>
                        </div>
                        {proposal.doclink && (
                            <div className="md:col-span-3">
                                <p className="text-sm text-muted-foreground">Generated Document</p>
                                <a
                                    href={proposal.doclink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    View PDF <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Items Total</span>
                                <span className="font-medium">{formatCurrency(proposal.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Additional Charge</span>
                                <span className="font-medium">{formatCurrency(proposal.additionalcharge)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tax Rate</span>
                                <span className="font-medium">{proposal.taxrate}%</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tax Amount</span>
                                <span className="font-medium">{formatCurrency(proposal.taxamount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Discount</span>
                                <span className="font-medium">{formatCurrency(proposal.discount)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="font-semibold">Grand Total</span>
                                <span className="font-bold text-lg">{formatCurrency(proposal.grandtotal)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Proposal Items */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Proposal Items</CardTitle>
                        <Button onClick={handleAddItem}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {proposal.items && proposal.items.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Serial No</TableHead>
                                    <TableHead>SAC Code</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Rate</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proposal.items.map((item: ProposalItem) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.location?.displayName || '-'}</TableCell>
                                        <TableCell>{item.invoice?.invoiceNo || '-'}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{item.product?.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.product?.model}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.serialno || '-'}</TableCell>
                                        <TableCell>{item.saccode || '-'}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
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
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No items added yet. Click "Add Item" to get started.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Item Dialog */}
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedItem ? 'Edit Item' : 'Add Item'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedItem ? 'Update the item information' : 'Add a new item to the proposal'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitItem)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="locationId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select location" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
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
                                    name="invoiceId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Invoice *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select invoice" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {filteredInvoices.map((invoice: any) => (
                                                        <SelectItem key={invoice.id} value={invoice.id.toString()}>
                                                            {invoice.invoiceNo}
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
                                    name="productId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!selectedInvoiceId}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select product" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {invoiceItems.map((item: any) => (
                                                        <SelectItem key={item.id} value={item.productId.toString()}>
                                                            {item.product?.name} - {item.product?.model}
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
                                    name="serialno"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Serial Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="SN-12345" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="saccode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SAC Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="998314" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity *</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rate *</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" min="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount (Auto-calculated)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" readOnly {...field} />
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
            </Dialog >

            {/* Delete Item Confirmation Dialog */}
            < Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} >
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

            {/* Send Email Dialog */}
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Proposal Email</DialogTitle>
                        <DialogDescription>
                            Send the proposal PDF to the customer via email
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Recipient Email</label>
                            <Input
                                type="email"
                                placeholder="customer@example.com"
                                value={emailRecipient}
                                onChange={(e) => setEmailRecipient(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Message (Optional)</label>
                            <Input
                                placeholder="Additional message for the customer"
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEmailDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendEmail}
                            disabled={!emailRecipient || sendingEmail}
                        >
                            {sendingEmail ? 'Sending...' : 'Send Email'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Proposal Documents Drawer */}
            <Sheet open={isDocumentsDrawerOpen} onOpenChange={setIsDocumentsDrawerOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Proposal Documents</SheetTitle>
                        <SheetDescription>
                            View all generated documents for proposal {proposal?.proposalno}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        {documents.length > 0 ? (
                            documents.map((doc: any, index: number) => (
                                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    Document #{index + 1}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDate(doc.createdat)}
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="ml-2">
                                                PDF
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="text-sm">
                                            <p className="text-muted-foreground text-xs">Proposal Number</p>
                                            <p className="font-medium">{doc.proposalno}</p>
                                        </div>
                                        {doc.createdby && (
                                            <div className="text-sm">
                                                <p className="text-muted-foreground text-xs">Created By</p>
                                                <p className="font-medium">{doc.createdby}</p>
                                            </div>
                                        )}
                                        <Separator className="my-2" />
                                        <a
                                            href={doc.doclink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            View Document
                                        </a>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileStack className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">No documents generated yet</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Click "Generate Proposal" to create a document
                                </p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Email Records Drawer */}
            <Sheet open={isEmailRecordsDrawerOpen} onOpenChange={setIsEmailRecordsDrawerOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Email Records</SheetTitle>
                        <SheetDescription>
                            View all email records for proposal {proposal?.proposalno}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        {emailRecords.length > 0 ? (
                            emailRecords.map((record: any, index: number) => (
                                <Card key={record.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                    Email #{index + 1}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDate(record.createdat)}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={record.status === 'sent' ? 'default' : 'secondary'}
                                                className="ml-2"
                                            >
                                                {record.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="text-sm">
                                            <p className="text-muted-foreground text-xs">Recipient</p>
                                            <p className="font-medium break-all">{record.email}</p>
                                        </div>
                                        <div className="text-sm">
                                            <p className="text-muted-foreground text-xs">Proposal Number</p>
                                            <p className="font-medium">{record.proposalno}</p>
                                        </div>
                                        {record.sentby && (
                                            <div className="text-sm">
                                                <p className="text-muted-foreground text-xs">Sent By</p>
                                                <p className="font-medium">{record.sentby}</p>
                                            </div>
                                        )}
                                        {record.message && (
                                            <>
                                                <Separator className="my-2" />
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground text-xs mb-1">Message</p>
                                                    <p className="text-sm bg-muted p-2 rounded-md">
                                                        {record.message}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Inbox className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">No email records found</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Send an email to create a record
                                </p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
