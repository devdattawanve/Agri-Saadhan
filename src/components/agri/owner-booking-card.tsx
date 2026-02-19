"use client";

import { useState } from "react";
import { useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import type { Booking } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";
import { format } from 'date-fns';

export function OwnerBookingCard({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
        if (!firestore || isUpdating) return;
        setIsUpdating(true);
        const bookingRef = doc(firestore, 'bookings', booking.id);
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
            setIsUpdating(false); 
        }
    };

    return (
        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="font-semibold">Request for <span className="font-mono text-sm">{booking.equipmentName}</span></p>
                    <p className="text-sm text-muted-foreground">
                        From Farmer: <span className="font-mono text-sm">{booking.farmerId.substring(0, 7)}...</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Dates: {booking.startDate?.toDate ? format(booking.startDate.toDate(), 'PPp') : ''} - {booking.endDate?.toDate ? format(booking.endDate.toDate(), 'PPp') : ''}
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <p className="font-bold text-lg whitespace-nowrap">Rs. {booking.totalPrice.toFixed(2)}</p>
                    <div className="flex gap-2 ml-auto">
                        {isUpdating ? (
                            <Button size="icon" disabled>
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </Button>
                        ) : (
                            <>
                                <Button aria-label="Accept" size="icon" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleUpdateStatus('accepted')}><Check /></Button>
                                <Button aria-label="Reject" size="icon" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleUpdateStatus('rejected')}><X /></Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
