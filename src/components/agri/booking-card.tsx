"use client";

import { useState, useEffect } from "react";
import { useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/data";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Loader2, Info, Star } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RatingForm } from "./rating-form";

const statusColors: { [key: string]: string } = {
    pending: "bg-yellow-500 hover:bg-yellow-600",
    accepted: "bg-green-500 hover:bg-green-600",
    rejected: "bg-red-500 hover:bg-red-600",
    cancelled: "bg-gray-500 hover:bg-gray-600",
    completed: "bg-blue-500 hover:bg-blue-600",
};

export function BookingCard({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isCancelling, setIsCancelling] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    useEffect(() => {
        if (firestore && (booking.status === 'accepted' || booking.status === 'rejected') && !booking.statusChangeAcknowledged) {
            toast({
                title: `Booking ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`,
                description: `Your booking for "${booking.equipmentName}" has been ${booking.status}.`,
                variant: booking.status === 'rejected' ? 'destructive' : 'default',
                duration: 10000,
            });

            const bookingRef = doc(firestore, 'bookings', booking.id);
            setDocumentNonBlocking(bookingRef, { statusChangeAcknowledged: true }, { merge: true });
        }
    }, [booking.status, booking.statusChangeAcknowledged, booking.id, booking.equipmentName, firestore, toast]);

    const handleCancelBooking = async () => {
        if (!firestore) return;
        setIsCancelling(true);
        const bookingRef = doc(firestore, 'bookings', booking.id);
        try {
            await setDocumentNonBlocking(bookingRef, { status: 'cancelled', updatedAt: new Date(), statusChangeAcknowledged: false }, { merge: true });
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

    const handleRatingSubmit = async (rating: number, description: string) => {
        if (!firestore) return;
        setIsSubmittingRating(true);
        const bookingRef = doc(firestore, 'bookings', booking.id);
        try {
            await setDocumentNonBlocking(bookingRef, { rating, ratingDescription: description, updatedAt: serverTimestamp() }, { merge: true });
            toast({
                title: "Rating Submitted",
                description: "Thank you for your feedback!",
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Rating Submission Failed",
                description: error.message,
            });
        } finally {
            setIsSubmittingRating(false);
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
                                Booked from {booking.startDate?.toDate ? format(booking.startDate.toDate(), 'PP p') : ''}
                            </p>
                             <p className="text-sm text-muted-foreground">
                                to {booking.endDate?.toDate ? format(booking.endDate.toDate(), 'PP p') : ''}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <Badge className={`${statusColors[booking.status] || 'bg-gray-400'} text-white capitalize`}>{booking.status}</Badge>
                        </div>
                    </div>
                     {booking.status === 'accepted' && booking.completionOtp && (
                        <Alert className="mt-4 bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4" />
                            <AlertTitle className="font-semibold text-blue-800">Action Required</AlertTitle>
                            <AlertDescription className="text-blue-700">
                                Share this OTP with the owner to complete the job: <strong className="text-lg font-mono tracking-widest text-blue-900">{booking.completionOtp}</strong>
                            </AlertDescription>
                        </Alert>
                    )}
                     {booking.status === 'completed' && (
                        booking.rating ? (
                             <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold">Your Rating</h4>
                                <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 ${i < booking.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                {booking.ratingDescription && <p className="text-sm text-muted-foreground mt-1 italic">"{booking.ratingDescription}"</p>}
                            </div>
                        ) : (
                            <RatingForm onSubmit={handleRatingSubmit} isSubmitting={isSubmittingRating} />
                        )
                    )}
                    <div className="flex justify-between items-end mt-4 flex-grow">
                         <p className="font-bold text-lg self-end">Total: Rs. {booking.totalPrice.toFixed(2)}</p>
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
