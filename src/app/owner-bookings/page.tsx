"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/data";
import { format } from 'date-fns';

export default function OwnerBookingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "bookings"), where("ownerId", "==", user.uid));
    }, [user, firestore]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Bookings Received</CardTitle>
                <CardDescription>A list of all bookings for your equipment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                
                {bookings && bookings.length > 0 && bookings.map(booking => (
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
                           <Badge variant={booking.status === 'pending' ? 'destructive' : 'secondary'} className="capitalize">{booking.status}</Badge>
                           <p className="font-bold text-lg mt-1">₹{booking.totalAmount}</p>
                        </div>
                    </div>
                ))}

                {!isLoading && (!bookings || bookings.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground">
                        You have not received any bookings for your equipment yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
