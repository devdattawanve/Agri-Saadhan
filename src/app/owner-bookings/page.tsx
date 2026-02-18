"use client";

import { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/data";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, X } from "lucide-react";

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
    const { toast } = useToast();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "bookings"), where("ownerId", "==", user.uid));
    }, [user, firestore]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    const handleUpdateStatus = async (bookingId: string, status: 'confirmed' | 'rejected') => {
        if (!firestore) return;
        const bookingRef = doc(firestore, 'bookings', bookingId);
        try {
            await setDocumentNonBlocking(bookingRef, { status, updatedAt: serverTimestamp() }, { merge: true });
            toast({
                title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                description: `The booking request has been ${status}.`,
            });
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: "Update Failed",
                description: error.message || "There was an error updating the booking status.",
            });
        }
    };

    const pendingBookings = useMemo(() => bookings?.filter(b => b.status === 'pending') || [], [bookings]);
    const otherBookings = useMemo(() => bookings?.filter(b => b.status !== 'pending') || [], [bookings]);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Pending Requests</CardTitle>
                    <CardDescription>These are new booking requests that need your approval.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && <Skeleton className="h-24 w-full" />}
                    {pendingBookings.length > 0 ? pendingBookings.map(booking => (
                        <Card key={booking.id}>
                            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <p className="font-semibold">Request for <span className="font-mono text-sm">{(booking as any).equipmentName}</span></p>
                                    <p className="text-sm text-muted-foreground">
                                        From Beneficiary: <span className="font-mono text-sm">{booking.beneficiary.substring(0, 7)}...</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Dates: {booking.startDate?.toDate ? format(booking.startDate.toDate(), 'PP') : ''} - {booking.endDate?.toDate ? format(booking.endDate.toDate(), 'PP') : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <p className="font-bold text-lg whitespace-nowrap">₹{booking.totalAmount.toFixed(2)}</p>
                                    <div className="flex gap-2 ml-auto">
                                        <Button size="icon" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleUpdateStatus(booking.id, 'confirmed')}><Check /></Button>
                                        <Button size="icon" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleUpdateStatus(booking.id, 'rejected')}><X /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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
                    
                    {otherBookings.length > 0 ? otherBookings.map(booking => (
                        <div key={booking.id} className="border rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Booking for Equip. ID: <span className="font-mono text-sm">{booking.equipmentId.substring(0, 7)}...</span></p>
                                <p className="text-sm text-muted-foreground">
                                    From Beneficiary: <span className="font-mono text-sm">{booking.beneficiary.substring(0, 7)}...</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Received on: {booking.createdAt?.toDate ? format(booking.createdAt.toDate(), 'PPP') : 'Just now'}
                                </p>
                            </div>
                            <div className="text-right">
                            <Badge className={`${statusColors[booking.status] || 'bg-gray-400'} text-white capitalize`}>{booking.status}</Badge>
                            <p className="font-bold text-lg mt-1">₹{booking.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    )) : !isLoading && (
                         <div className="text-center py-10 text-muted-foreground">
                            You have not received any bookings for your equipment yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
