"use client";

import { useState } from "react";
import { useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import type { Booking } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, Star } from "lucide-react";

const statusColors: { [key: string]: string } = {
    accepted: "bg-green-500 hover:bg-green-600",
    rejected: "bg-red-500 hover:bg-red-600",
    cancelled: "bg-gray-500 hover:bg-gray-600",
    completed: "bg-blue-500 hover:bg-blue-600",
};

export function OwnerBookingHistoryCard({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [otp, setOtp] = useState("");
    const [isCompleting, setIsCompleting] = useState(false);

    const handleCompleteBooking = async () => {
        if (!firestore) return;
        if (otp !== booking.completionOtp) {
            toast({
                variant: "destructive",
                title: "Invalid OTP",
                description: "The OTP entered is incorrect. Please check with the farmer.",
            });
            return;
        }

        setIsCompleting(true);
        const bookingRef = doc(firestore, 'bookings', booking.id);
        try {
            await setDocumentNonBlocking(bookingRef, { status: 'completed', updatedAt: serverTimestamp() }, { merge: true });
            toast({
                title: "Booking Completed!",
                description: "The booking has been marked as completed.",
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Completion Failed",
                description: error.message || "There was an error completing the booking.",
            });
            setIsCompleting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-lg">{booking.equipmentName}</CardTitle>
                    <Badge className={`${statusColors[booking.status]} text-white capitalize`}>{booking.status}</Badge>
                </div>
                <CardDescription>
                    Booked By: <span className="font-mono text-xs">{booking.farmerId.substring(0, 8)}...</span> | {format(booking.startDate.toDate(), 'PP')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {booking.status === 'accepted' && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Enter OTP from farmer to complete the job:</p>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="6-digit OTP" 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                type="tel"
                                className="font-mono tracking-widest"
                            />
                            <Button onClick={handleCompleteBooking} disabled={isCompleting || otp.length !== 6}>
                                {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Job"}
                            </Button>
                        </div>
                    </div>
                )}
                 {booking.status === 'completed' && (
                    <div className="text-center p-4 bg-muted rounded-md">
                        <p className="font-semibold text-green-700">Job Completed Successfully</p>
                        {booking.rating ? (
                             <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 ${i < booking.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                {booking.ratingDescription && <p className="text-sm text-muted-foreground italic">"{booking.ratingDescription}"</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-1">Waiting for farmer's rating.</p>
                        )}
                    </div>
                )}
                 {(booking.status === 'rejected' || booking.status === 'cancelled') && (
                     <div className="text-center p-4 bg-muted rounded-md">
                        <p className="font-semibold text-muted-foreground capitalize">{booking.status}</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
