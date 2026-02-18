"use client";

import { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/data";
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OwnerBookingCard } from "@/components/agri/owner-booking-card";

const statusColors: { [key: string]: string } = {
    pending: "bg-yellow-500 hover:bg-yellow-600",
    confirmed: "bg-green-500 hover:bg-green-600",
    rejected: "bg-red-500 hover:bg-red-600",
    cancelled: "bg-gray-500 hover:bg-gray-600",
    ongoing: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-primary"
};

export default function OwnerBookingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, "bookings"),
            where("participants", "array-contains", user.uid)
        );
    }, [user, firestore]);

    const { data: allOwnerBookings, isLoading } = useCollection<Booking>(bookingsQuery);
    
    const sortedBookings = useMemo(() => {
        if (!allOwnerBookings) return null;
        return allOwnerBookings
            .filter(b => b.ownerId === user?.uid)
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    }, [allOwnerBookings, user]);

    const pendingBookings = useMemo(() => sortedBookings?.filter(b => b.status === 'pending') ?? [], [sortedBookings]);
    const otherBookings = useMemo(() => sortedBookings?.filter(b => b.status !== 'pending') ?? [], [sortedBookings]);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Pending Requests</CardTitle>
                    <CardDescription>These are new booking requests that need your approval.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && <Skeleton className="h-24 w-full" />}
                    {!isLoading && pendingBookings.length > 0 ? pendingBookings.map(booking => (
                        <OwnerBookingCard key={booking.id} booking={booking} />
                    )) : !isLoading && (
                        <Alert>
                            <AlertTitle>All Caught Up!</AlertTitle>
                            <AlertDescription>You have no pending booking requests.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">All Bookings</CardTitle>
                    <CardDescription>A history of all bookings for your equipment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                    
                    {!isLoading && otherBookings.length > 0 ? otherBookings.map(booking => (
                        <div key={booking.id} className="border rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{booking.equipmentName}</p>
                                <p className="text-sm text-muted-foreground">
                                    Beneficiary: <span className="font-mono text-sm">{booking.beneficiary.substring(0, 7)}...</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Received: {booking.createdAt?.toDate ? format(booking.createdAt.toDate(), 'PP') : 'Just now'}
                                </p>
                            </div>
                            <div className="text-right">
                            <Badge className={`${statusColors[booking.status] || 'bg-gray-400'} text-white capitalize`}>{booking.status}</Badge>
                            <p className="font-bold text-lg mt-1">₹{booking.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    )) : !isLoading && (
                         <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                            You have not received any bookings for your equipment yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
