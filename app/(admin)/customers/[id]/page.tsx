'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ArrowLeft, Edit } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import { GET_CUSTOMER } from '@/graphql/queries';
import {
    UPDATE_CUSTOMER,
    CREATE_CUSTOMER_LOCATION,
    UPDATE_CUSTOMER_LOCATION,
    DELETE_CUSTOMER_LOCATION
} from '@/graphql/mutations';
import { CustomerMaster, CustomerLocation } from '@/types';

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
import { Textarea } from '@/components/ui/textarea';
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

const customerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    details: z.string().optional(),
    contactPerson: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
    status: z.string(),
});

const locationSchema = z.object({
    displayName: z.string().min(1, 'Display name is required'),
    location: z.string().optional(),
    contactPerson: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone1: z.string().optional(),
    phone2: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pin: z.string().optional(),
    gstin: z.string().optional(),
    pan: z.string().optional(),
    status: z.string(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;
type LocationFormValues = z.infer<typeof locationSchema>;

export default function CustomerDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = parseInt(params.id as string);

    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<CustomerLocation | null>(null);

    const { data, loading, refetch } = useQuery(GET_CUSTOMER, {
        variables: { id: customerId },
    });

    const [updateCustomer, { loading: updatingCustomer }] = useMutation(UPDATE_CUSTOMER);
    const [createLocation, { loading: creatingLocation }] = useMutation(CREATE_CUSTOMER_LOCATION);
    const [updateLocation, { loading: updatingLocation }] = useMutation(UPDATE_CUSTOMER_LOCATION);
    const [deleteLocation, { loading: deletingLocation }] = useMutation(DELETE_CUSTOMER_LOCATION);

    const customerForm = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
            details: '',
            contactPerson: '',
            email: '',
            address: '',
            status: 'active',
        },
    });

    const locationForm = useForm<LocationFormValues>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            displayName: '',
            location: '',
            contactPerson: '',
            email: '',
            phone1: '',
            phone2: '',
            address: '',
            city: '',
            state: '',
            pin: '',
            gstin: '',
            pan: '',
            status: 'active',
        },
    });

    const customer: CustomerMaster | undefined = (data as any)?.customer;
    const locations: CustomerLocation[] = customer?.locations || [];

    const handleEditCustomer = () => {
        if (!customer) return;
        customerForm.reset({
            name: customer.name,
            details: customer.details || '',
            contactPerson: customer.contactPerson || '',
            email: customer.email || '',
            address: customer.address || '',
            status: customer.status,
        });
        setIsCustomerDialogOpen(true);
    };

    const handleAddLocation = () => {
        setSelectedLocation(null);
        locationForm.reset({
            displayName: '',
            location: '',
            contactPerson: '',
            email: '',
            phone1: '',
            phone2: '',
            address: '',
            city: '',
            state: '',
            pin: '',
            gstin: '',
            pan: '',
            status: 'active',
        });
        setIsLocationDialogOpen(true);
    };

    const handleEditLocation = (location: CustomerLocation) => {
        setSelectedLocation(location);
        locationForm.reset({
            displayName: location.displayName,
            location: location.location || '',
            contactPerson: location.contactPerson || '',
            email: location.email || '',
            phone1: location.phone1 || '',
            phone2: location.phone2 || '',
            address: location.address || '',
            city: location.city || '',
            state: location.state || '',
            pin: location.pin || '',
            gstin: location.gstin || '',
            pan: location.pan || '',
            status: location.status,
        });
        setIsLocationDialogOpen(true);
    };

    const handleDeleteLocation = (location: CustomerLocation) => {
        setSelectedLocation(location);
        setIsDeleteDialogOpen(true);
    };

    const onCustomerSubmit = async (values: CustomerFormValues) => {
        try {
            const input = {
                ...values,
                details: values.details || undefined,
                contactPerson: values.contactPerson || undefined,
                email: values.email || undefined,
                address: values.address || undefined,
            };

            await updateCustomer({
                variables: {
                    id: customerId,
                    input,
                },
            });
            toast.success('Customer updated successfully');
            setIsCustomerDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const onLocationSubmit = async (values: LocationFormValues) => {
        try {
            const input = {
                customerId,
                ...values,
                location: values.location || undefined,
                contactPerson: values.contactPerson || undefined,
                email: values.email || undefined,
                phone1: values.phone1 || undefined,
                phone2: values.phone2 || undefined,
                address: values.address || undefined,
                city: values.city || undefined,
                state: values.state || undefined,
                pin: values.pin || undefined,
                gstin: values.gstin || undefined,
                pan: values.pan || undefined,
            };

            if (selectedLocation) {
                await updateLocation({
                    variables: {
                        id: selectedLocation.id,
                        input,
                    },
                });
                toast.success('Location updated successfully');
            } else {
                await createLocation({
                    variables: {
                        input,
                    },
                });
                toast.success('Location created successfully');
            }
            setIsLocationDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const confirmDeleteLocation = async () => {
        if (!selectedLocation) return;
        try {
            await deleteLocation({
                variables: {
                    id: selectedLocation.id,
                },
            });
            toast.success('Location deleted successfully');
            setIsDeleteDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
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

    if (!customer) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.push('/customers')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                </Button>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Customer not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push('/customers')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                </Button>
            </div>

            {/* Customer Information Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{customer.name}</CardTitle>
                            <CardDescription>Customer Information</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                                {customer.status}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={handleEditCustomer}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Customer
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                            <p className="text-sm">{customer.contactPerson || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="text-sm">{customer.email || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                            <p className="text-sm">{customer.address || '-'}</p>
                        </div>
                        {customer.details && (
                            <div className="md:col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Details</p>
                                <p className="text-sm">{customer.details}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Locations Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Locations</CardTitle>
                            <CardDescription>Manage customer locations</CardDescription>
                        </div>
                        <Button onClick={handleAddLocation}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Location
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {locations.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No locations found. Add a location to get started.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map((location) => (
                                    <TableRow key={location.id}>
                                        <TableCell className="font-medium">{location.displayName}</TableCell>
                                        <TableCell>{location.location || '-'}</TableCell>
                                        <TableCell>{location.contactPerson || '-'}</TableCell>
                                        <TableCell>{location.email || '-'}</TableCell>
                                        <TableCell>{location.phone1 || '-'}</TableCell>
                                        <TableCell>{location.city || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                                                {location.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditLocation(location)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteLocation(location)}
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

            {/* Edit Customer Dialog */}
            <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>Update the customer information</DialogDescription>
                    </DialogHeader>
                    <Form {...customerForm}>
                        <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                            <FormField
                                control={customerForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Customer name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={customerForm.control}
                                name="contactPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contact person name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={customerForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={customerForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Customer address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={customerForm.control}
                                name="details"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Details</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Additional details" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={customerForm.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCustomerDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updatingCustomer}>
                                    {updatingCustomer ? 'Saving...' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Location Dialog */}
            <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedLocation ? 'Edit Location' : 'Add Location'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedLocation
                                ? 'Update the location information'
                                : 'Create a new location for this customer'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...locationForm}>
                        <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={locationForm.control}
                                    name="displayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Location display name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Location name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="contactPerson"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Person</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contact person name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="email@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="phone1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone 1</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Primary phone" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="phone2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone 2</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Secondary phone" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input placeholder="State" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="pin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PIN Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PIN code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="gstin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GSTIN</FormLabel>
                                            <FormControl>
                                                <Input placeholder="GST identification number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="pan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PAN</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PAN number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={locationForm.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormField
                                control={locationForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Full address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsLocationDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creatingLocation || updatingLocation}>
                                    {creatingLocation || updatingLocation ? 'Saving...' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Location Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedLocation?.displayName}"? This action
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
                            onClick={confirmDeleteLocation}
                            disabled={deletingLocation}
                        >
                            {deletingLocation ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
