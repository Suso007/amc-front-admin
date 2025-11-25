import { Ban } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NoAccessPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <Ban className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
                    <CardDescription>
                        You do not have permission to access the admin panel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-sm text-muted-foreground">
                        This area is restricted to administrators only. If you believe this is an error,
                        please contact your system administrator.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/login">Return to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
