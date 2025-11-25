'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { GET_AMC_PROPOSALS, GET_CUSTOMERS } from '@/graphql/queries';
import { CREATE_AMC_PROPOSAL, UPDATE_AMC_PROPOSAL, DELETE_AMC_PROPOSAL } from '@/graphql/mutations';
import { AmcProposal } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const proposalSchema = z.object({
    proposalno: z.string().min(1, 'Proposal number is required'),
    proposaldate: z.string().min(1, 'Proposal date is required'),
    amcstartdate: z.string().min(1, 'AMC start date is required'),
    amcenddate: z.string().min(1, 'AMC end date is required'),
    customerId: z.string().min(1, 'Customer is required'),
    contractno: z.string().optional(),
    billingaddress: z.string().optional(),
    additionalcharge: z.string().optional(),
    discount: z.string().optional(),
    taxrate: z.string().optional(),
    proposalstatus: z.string(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'new':
            return 'bg-blue-500';
        case 'sent':
            return 'bg-cyan-500';
        case 'pending':
            return 'bg-yellow-500';
        case 'on process':
            return 'bg-orange-500';
        case 'accepted':
            return 'bg-green-500';
        case 'paymentdue':
            return 'bg-red-500';
        case 'paid':
            return 'bg-emerald-500';
        case 'active':
            return 'bg-teal-500';
        case 'expired':
            return 'bg-gray-500';
        case 'on renew':
            return 'bg-purple-500';
        default:
            return 'bg-gray-500';
    }
};

export default function AmcProposalsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<AmcProposal | null>(null);

    const { data, loading, refetch } = useQuery(GET_AMC_PROPOSALS, {
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

    const [createProposal, { loading: creating }] = useMutation(CREATE_AMC_PROPOSAL);
    const [updateProposal, { loading: updating }] = useMutation(UPDATE_AMC_PROPOSAL);
    const [deleteProposal, { loading: deleting }] = useMutation(DELETE_AMC_PROPOSAL);

    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            proposalno: '',
            proposaldate: new Date().toISOString().split('T')[0],
            amcstartdate: new Date().toISOString().split('T')[0],
            amcenddate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            customerId: '',
            contractno: '',
            billingaddress: '',
            additionalcharge: '0',
            discount: '0',
            taxrate: '0',
            proposalstatus: 'new',
        },
    });

    const customers = (customersData as any)?.customers?.data || [];

    const handleAdd = () => {
        setSelectedProposal(null);
        form.reset({
            proposalno: '',
            proposaldate: new Date().toISOString().split('T')[0],
            amcstartdate: new Date().toISOString().split('T')[0],
            amcenddate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            customerId: '',
            contractno: '',
            billingaddress: '',
            additionalcharge: '0',
            discount: '0',
            taxrate: '0',
            proposalstatus: 'new',
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (proposal: AmcProposal) => {
        setSelectedProposal(proposal);
        form.reset({
            proposalno: proposal.proposalno,
            proposaldate: proposal.proposaldate.split('T')[0],
            amcstartdate: proposal.amcstartdate.split('T')[0],
            amcenddate: proposal.amcenddate.split('T')[0],
            customerId: proposal.customerId.toString(),
            contractno: proposal.contractno || '',
            billingaddress: proposal.billingaddress || '',
            additionalcharge: proposal.additionalcharge.toString(),
            discount: proposal.discount.toString(),
            taxrate: proposal.taxrate.toString(),
            proposalstatus: proposal.proposalstatus,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (proposal: AmcProposal) => {
        setSelectedProposal(proposal);
        setIsDeleteDialogOpen(true);
    };

    const handleViewDetails = (proposalId: number) => {
        router.push(`/amc-proposals/${proposalId}`);
    };

    const onSubmit = async (values: ProposalFormValues) => {
        try {
            const input = {
                proposalno: values.proposalno,
                proposaldate: values.proposaldate,
                amcstartdate: values.amcstartdate,
                amcenddate: values.amcenddate,
                customerId: parseInt(values.customerId),
                contractno: values.contractno || undefined,
                billingaddress: values.billingaddress || undefined,
                additionalcharge: parseFloat(values.additionalcharge || '0'),
                discount: parseFloat(values.discount || '0'),
                taxrate: parseFloat(values.taxrate || '0'),
                proposalstatus: values.proposalstatus,
            };

            if (selectedProposal) {
                await updateProposal({
                    variables: {
                        id: selectedProposal.id,
                        input,
                    },
                });
                toast.success('Proposal updated successfully');
            } else {
                await createProposal({
                    variables: {
                        input,
                    },
                });
                toast.success('Proposal created successfully');
            }
            setIsDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const confirmDelete = async () => {
        if (!selectedProposal) return;
        try {
            await deleteProposal({
                variables: {
                    id: selectedProposal.id,
                },
            });
            toast.success('Proposal deleted successfully');
            setIsDeleteDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const proposals = (data as any)?.amcProposals?.data || [];
    const pagination = (data as any)?.amcProposals?.pagination;

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
                    <h1 className="text-xl font-bold tracking-tight">AMC Proposals</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage AMC proposals and proposal items
                    </p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Proposal
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1 md:max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search proposals..."
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
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
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
                                        <TableHead>Proposal No</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Proposal Date</TableHead>
                                        <TableHead>AMC Period</TableHead>
                                        <TableHead className="text-right">Grand Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {proposals.map((proposal: AmcProposal) => (
                                        <TableRow key={proposal.id}>
                                            <TableCell className="font-medium">{proposal.proposalno}</TableCell>
                                            <TableCell>{proposal.customer?.name || '-'}</TableCell>
                                            <TableCell>{formatDate(proposal.proposaldate)}</TableCell>
                                            <TableCell>
                                                {formatDate(proposal.amcstartdate)} - {formatDate(proposal.amcenddate)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(proposal.grandtotal)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(proposal.proposalstatus)}>
                                                    {statusOptions.find(s => s.value === proposal.proposalstatus)?.label || proposal.proposalstatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewDetails(proposal.id)}
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(proposal)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(proposal)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {proposals.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    No proposals found
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedProposal ? 'Edit Proposal' : 'Add Proposal'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedProposal
                                ? 'Update the proposal information'
                                : 'Create a new AMC proposal'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="proposalno"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proposal Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PROP-001" {...field} />
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
                                            <FormLabel>Customer *</FormLabel>
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
                                    name="proposaldate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proposal Date *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contractno"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contract Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="CONTRACT-001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amcstartdate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>AMC Start Date *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amcenddate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>AMC End Date *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="additionalcharge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Charge</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
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
                                    name="taxrate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tax Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="proposalstatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {statusOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="billingaddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Billing Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter billing address" rows={3} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                        <DialogTitle>Delete Proposal</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete proposal "{selectedProposal?.proposalno}"? This action
                            cannot be undone and will also delete all associated proposal items.
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
