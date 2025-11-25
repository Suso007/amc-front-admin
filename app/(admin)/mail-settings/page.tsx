'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { GET_MAIL_SETUP } from '@/graphql/queries';
import { UPDATE_MAIL_SETUP } from '@/graphql/mutations';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

const mailSetupSchema = z.object({
    smtphost: z.string().min(1, 'SMTP host is required'),
    smtpport: z.number().min(1, 'SMTP port is required'),
    smtpuser: z.string().min(1, 'SMTP user is required'),
    smtppassword: z.string().min(1, 'SMTP password is required'),
    enablessl: z.boolean(),
    sendername: z.string().min(1, 'Sender name is required'),
    senderemail: z.string().email('Invalid email address'),
});

type MailSetupFormValues = z.infer<typeof mailSetupSchema>;

export default function MailSettingsPage() {
    const { data, loading } = useQuery(GET_MAIL_SETUP);
    const [updateMailSetup, { loading: updating }] = useMutation(UPDATE_MAIL_SETUP);

    const form = useForm<MailSetupFormValues>({
        resolver: zodResolver(mailSetupSchema),
        defaultValues: {
            smtphost: '',
            smtpport: 587,
            smtpuser: '',
            smtppassword: '',
            enablessl: true,
            sendername: '',
            senderemail: '',
        },
    });

    useEffect(() => {
        if ((data as any)?.getMailSetup) {
            const mailSetup = (data as any).getMailSetup;
            form.reset({
                smtphost: mailSetup.smtphost,
                smtpport: mailSetup.smtpport,
                smtpuser: mailSetup.smtpuser,
                smtppassword: mailSetup.smtppassword,
                enablessl: mailSetup.enablessl,
                sendername: mailSetup.sendername,
                senderemail: mailSetup.senderemail,
            });
        }
    }, [data, form]);

    const onSubmit = async (values: MailSetupFormValues) => {
        try {
            await updateMailSetup({
                variables: {
                    input: values,
                },
            });
            toast.success('Mail settings updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mail Settings</h1>
                <p className="text-muted-foreground">
                    Configure SMTP settings for email notifications
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>SMTP Configuration</CardTitle>
                    <CardDescription>
                        Update your email server settings to send notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(7)].map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="smtphost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SMTP Host</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="smtp.example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="smtpport"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SMTP Port</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="587"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="smtpuser"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SMTP Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="username" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="smtppassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SMTP Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="enablessl"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Enable SSL/TLS
                                                </FormLabel>
                                                <FormDescription>
                                                    Use SSL/TLS encryption for secure email transmission
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="sendername"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sender Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="AMC Management" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="senderemail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sender Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="noreply@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={updating}>
                                        {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Settings
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
