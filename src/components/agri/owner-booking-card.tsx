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

    const handleUpdateStatus = async (status: 'confirmed' | 'rejected') => {
        if (!firestore || isUpdating) return;
        setIsUpdating(true);
        const bookingRef = doc(firestore, 'bookings', booking.id);
        try {
            await setDocumentNonBlocking(bookingRef, { status, updatedAt: serverTimestamp() }, { merge: true });
            toast({
                title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                description: `The booking request has been ${status}.`,
            });
            // The component will re-render via the onSnapshot listener on the parent page,
            // so we don't need to set isUpdating back to false on success.
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: "Update Failed",
                description: error.message || "There was an error updating the booking status.",
            });
            setIsUpdating(false); // Only set back to false on error
        }
    };

    return (
        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="font-semibold">Request for <span className="font-mono text-sm">{booking.equipmentName}</span></p>
                    <p className="text-sm text-muted-foreground">
                        From Beneficiary: <span className="font-mono text-sm">{booking.beneficiary.substring(0, 7)}...</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Dates: {booking.startDate?.toDate ? format(booking.startDate.toDate(), 'PPp') : ''} - {booking.endDate?.toDate ? format(booking.endDate.toDate(), 'PPp') : ''}
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <p className="font-bold text-lg whitespace-nowrap">₹{booking.totalAmount.toFixed(2)}</p>
                    <div className="flex gap-2 ml-auto">
                        {isUpdating ? (
                            <Button size="icon" disabled>
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </Button>
                        ) : (
                            <>
                                <Button aria-label="Confirm" size="icon" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleUpdateStatus('confirmed')}><Check /></Button>
                                <Button aria-label="Reject" size="icon" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleUpdateStatus('rejected')}><X /></Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
