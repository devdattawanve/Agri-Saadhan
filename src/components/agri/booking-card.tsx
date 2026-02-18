"use client";

import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Booking, Equipment } from "@/lib/data";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const statusColors: { [key: string]: string } = {
    pending: "bg-yellow-500 hover:bg-yellow-600",
    confirmed: "bg-green-500 hover:bg-green-600",
    rejected: "bg-red-500 hover:bg-red-600",
    cancelled: "bg-gray-500 hover:bg-gray-600",
    ongoing: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-primary"
};

export function BookingCard({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const equipmentDocRef = useMemoFirebase(() => {
        if (!firestore || !booking.equipmentId) return null;
        return doc(firestore, 'equipment', booking.equipmentId);
    }, [firestore, booking.equipmentId]);

    const { data: equipment, isLoading: isEquipmentLoading } = useDoc<Equipment>(equipmentDocRef);

    const handleCancelBooking = async () => {
        if (!firestore) return;
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
        }
    };

    if (isEquipmentLoading) {
        return <Skeleton className="h-36 w-full rounded-lg" />;
    }

    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 w-full sm:w-40 sm:h-auto flex-shrink-0">
                    <Image src={equipment?.imageUrl || '/placeholder.png'} alt={equipment?.name || 'Equipment'} layout="fill" className="object-cover" />
                </div>
                <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">{equipment?.name || 'Equipment'}</h3>
                             <p className="text-sm text-muted-foreground">
                                Booked from {booking.startDate?.toDate ? format(booking.startDate.toDate(), 'PPP p') : ''}
                            </p>
                             <p className="text-sm text-muted-foreground">
                                to {booking.endDate?.toDate ? format(booking.endDate.toDate(), 'PPP p') : ''}
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
                         <p className="font-bold text-lg">Total: ₹{booking.totalAmount.toFixed(2)}</p>
                        {booking.status === 'pending' && (
                            <Button variant="destructive" size="sm" onClick={handleCancelBooking}>Cancel Booking</Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
