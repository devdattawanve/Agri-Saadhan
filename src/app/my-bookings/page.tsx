"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookingCard } from "@/components/agri/booking-card";

export default function MyBookingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "bookings"), where("beneficiary", "==", user.uid));
    }, [user, firestore]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    const renderContent = () => {
      if (isLoading) {
        return (
          <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)}
          </div>
        );
      }

      if (!bookings || bookings.length === 0) {
        return (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="mb-4">You have not booked any equipment yet.</p>
                <Button asChild>
                  <Link href="/equipment">Browse Equipment</Link>
              </Button>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Bookings</CardTitle>
                <CardDescription>A list of all the equipment you have booked.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
        </Card>
    );
}
