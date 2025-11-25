'use client';

import { useAuthStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

export default function ProfilePage() {
    const { user } = useAuthStore();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading user information...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    View and manage your account information
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Your account details and status
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                            <p className="text-lg font-semibold">{user.name}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                            <p className="text-lg font-semibold">{user.email}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <Badge variant="default" className="text-sm">
                                {user.role.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                                {user.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                            <p className="text-lg">
                                {format(new Date(user.createdat), 'PPP')}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                            <p className="text-lg">
                                {format(new Date(user.updatedat), 'PPP')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
