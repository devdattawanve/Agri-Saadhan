"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/data";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

const statusColors: { [key: string]: string } = {
    pending: "bg-yellow-500 hover:bg-yellow-600",
    confirmed: "bg-green-500 hover:bg-green-600",
    rejected: "bg-red-500 hover:bg-red-600",
    cancelled: "bg-gray-500 hover:bg-gray-600",
    ongoing: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-primary"
};

const paymentStatusColors: { [key: string]: string } = {
    pending: "bg-yellow-500 hover:bg-yellow-600",
    completed: "bg-green-500 hover:bg-green-600",
    failed: "bg-red-500 hover:bg-red-600",
};


export default function MyBookingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        // Query for bookings where the user is the beneficiary
        return query(collection(firestore, "bookings"), where("beneficiary", "==", user.uid));
    }, [user, firestore]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    const handleCancelBooking = async (bookingId: string) => {
        if (!firestore) return;
        const bookingRef = doc(firestore, 'bookings', bookingId);
        try {
            await setDocumentNonBlocking(bookingRef, { status: 'cancelled' }, { merge: true });
            toast({
                title: "Booking Cancelled",
                description: "Your booking request has been successfully cancelled.",
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Cancellation Failed",
                description: error.message || "There was an error cancelling your booking.",
            });
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Bookings</CardTitle>
                <CardDescription>A list of all the equipment you have booked.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                
                {bookings && bookings.length > 0 && bookings.map(booking => (
                    <Card key={booking.id} className="overflow-hidden">
                        <div className="flex">
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <Image src={(booking as any).equipmentImage || '/placeholder.png'} alt={(booking as any).equipmentName || 'Equipment'} layout="fill" className="object-cover" />
                            </div>
                            <div className="p-4 flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{(booking as any).equipmentName || 'Equipment'}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.startDate?.toDate ? format(booking.startDate.toDate(), 'PPP p') : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <Badge className={`${statusColors[booking.status] || 'bg-gray-400'} text-white capitalize`}>{booking.status}</Badge>
                                        <Badge 
                                            variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'} 
                                            className="capitalize"
                                        >
                                            Payment: {booking.paymentStatus ?? 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                     <p className="font-bold text-lg">₹{booking.totalAmount.toFixed(2)}</p>
                                    {booking.status === 'pending' && (
                                        <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking.id)}>Cancel</Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {!isLoading && (!bookings || bookings.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="mb-4">You have not booked any equipment yet.</p>
                         <Button asChild>
                            <Link href="/equipment">Browse Equipment</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
