"use client";

import { useState } from "react";
import { useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/data";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Loader2 } from "lucide-react";

const statusColors: { [key: string]: string } = {
    pending: "bg-yellow-500 hover:bg-yellow-600",
    accepted: "bg-green-500 hover:bg-green-600",
    rejected: "bg-red-500 hover:bg-red-600",
    cancelled: "bg-gray-500 hover:bg-gray-600",
};

export function BookingCard({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelBooking = async () => {
        if (!firestore) return;
        setIsCancelling(true);
        const bookingRef = doc(firestore, 'bookings', booking.id);
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
            setIsCancelling(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 w-full sm:w-40 sm:h-auto flex-shrink-0 bg-muted">
                    <Image src={booking.equipmentImageUrl || '/placeholder.png'} alt={booking.equipmentName || 'Equipment'} layout="fill" className="object-cover" />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">{booking.equipmentName || 'Equipment'}</h3>
                             <p className="text-sm text-muted-foreground">
                                Booked from {booking.startDate?.toDate ? format(booking.startDate.toDate(), 'PPP p') : ''}
                            </p>
                             <p className="text-sm text-muted-foreground">
                                to {booking.endDate?.toDate ? format(booking.endDate.toDate(), 'PPP p') : ''}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <Badge className={`${statusColors[booking.status] || 'bg-gray-400'} text-white capitalize`}>{booking.status}</Badge>
                        </div>
                    </div>
                    <div className="flex justify-between items-end mt-4 flex-grow">
                         <p className="font-bold text-lg self-end">Total: ₹{booking.totalPrice.toFixed(2)}</p>
                        {booking.status === 'pending' && (
                            <Button variant="destructive" size="sm" onClick={handleCancelBooking} disabled={isCancelling}>
                                {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isCancelling ? "Cancelling..." : "Cancel Booking"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
