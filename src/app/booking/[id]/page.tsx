"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { notFound, useRouter, useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import type { Equipment } from "@/lib/data";

export default function BookingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [paymentOption, setPaymentOption] = useState("pay_on_delivery");
  const [loading, setLoading] = useState(false);

  const beneficiaryId = searchParams.get('beneficiaryId');
  const isSahayakBooking = !!beneficiaryId;

  const equipmentDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'equipment', id);
  }, [firestore, id]);

  const { data: equipment, isLoading: isEquipmentLoading } = useDoc<Equipment>(equipmentDocRef);

  const getDisplayPrice = (eq: Equipment) => {
    if (eq.price?.perHour) {
      return { amount: eq.price.perHour, unit: 'hour' };
    }
    if (eq.price?.perDay) {
      return { amount: eq.price.perDay, unit: 'day' };
    }
    return { amount: 0, unit: 'request' };
  };

  const handleConfirmBooking = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "You must be logged in to book."});
        return;
    }
    if (!equipment) {
        toast({ variant: "destructive", title: "Equipment data not loaded."});
        return;
    }
    setLoading(true);
    
    // Assumption: Use hourly price if available, otherwise daily.
    const bookingAmount = equipment.price?.perHour || equipment.price?.perDay || 0;

    const bookingData = {
        equipmentId: id,
        ownerId: equipment.ownerId, 
        driverId: null, // Placeholder
        
        createdBy: user.uid,
        beneficiary: isSahayakBooking ? beneficiaryId : user.uid,
        commissionEligible: isSahayakBooking,
        sahayakId: isSahayakBooking ? user.uid : null,

        status: 'pending',
        paymentStatus: paymentOption.toUpperCase(),
        totalAmount: bookingAmount,
        sahayakCommission: 0, 
        platformFee: 0, 
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    try {
        const bookingsColRef = collection(firestore, 'bookings');
        const newBookingRef = await addDocumentNonBlocking(bookingsColRef, bookingData);
        // Add booking id to the object before sending to firestore.
        if(newBookingRef) {
             const bookingDocWithId = { ...bookingData, id: newBookingRef.id };
             await addDocumentNonBlocking(bookingsColRef, bookingDocWithId);
        }
        
        toast({
            title: "Booking Confirmed!",
            description: `Your booking for ${equipment.name} is confirmed.`,
        });
        router.push('/dashboard');

    } catch (error: any) {
        console.error("Booking failed:", error);
        toast({
            variant: "destructive",
            title: "Booking Failed",
            description: error.message || "There was a problem confirming your booking.",
        });
    } finally {
        setLoading(false);
    }
  }

  if (isEquipmentLoading) {
      return (
          <div className="container mx-auto py-8 max-w-4xl">
              <Skeleton className="h-10 w-2/3 mb-6" />
              <div className="grid md:grid-cols-2 gap-8">
                  <div>
                      <Skeleton className="h-24 w-full mb-8" />
                      <Skeleton className="h-48 w-full" />
                  </div>
                  <div>
                      <Skeleton className="h-64 w-full" />
                  </div>
              </div>
              <Skeleton className="h-12 w-full max-w-md mx-auto mt-8" />
          </div>
      )
  }

  if (!equipment) {
      notFound();
  }

  const displayPrice = getDisplayPrice(equipment);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold font-headline mb-2">Confirm Your Booking</h1>
        {isSahayakBooking && <p className="text-lg text-muted-foreground mb-6">You are booking on behalf of another farmer.</p>}
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <Card>
                    <CardHeader className="flex flex-row items-start gap-4">
                        <Image src={equipment.imageUrl} alt={equipment.name} width={80} height={60} className="rounded-lg object-cover" />
                        <div>
                            <CardTitle className="font-headline">{equipment.name}</CardTitle>
                            <CardDescription>Price: ₹{displayPrice.amount}/{displayPrice.unit}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Payment Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup defaultValue="pay_on_delivery" onValueChange={setPaymentOption} className="space-y-4">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pay_on_delivery" id="r1" />
                                    <Label htmlFor="r1">Pay on Delivery</Label>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">Pay after the work is completed.</p>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="credit" id="r2" disabled={!isSahayakBooking} />
                                    <Label htmlFor="r2" className={!isSahayakBooking ? 'text-muted-foreground' : ''}>Credit (via Sahayak)</Label>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">Only available if booking through a Sahayak.</p>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Diesel Tracker Protocol</CardTitle>
                        <CardDescription>Ensure fair fuel usage for your rental.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="h-6 w-6 text-accent mt-1 shrink-0" />
                            <div>
                                <h4 className="font-semibold">1. Start of Work</h4>
                                <p className="text-sm text-muted-foreground">Driver uploads photo of the fuel gauge before starting.</p>
                                <Button variant="outline" size="sm" className="mt-2"><Upload className="mr-2 h-4 w-4" /> Upload Start Photo</Button>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <CircleDashed className="h-6 w-6 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <h4 className="font-semibold">2. End of Work</h4>
                                <p className="text-sm text-muted-foreground">Driver uploads another photo after finishing the work.</p>
                                 <Button variant="outline" size="sm" className="mt-2" disabled><Upload className="mr-2 h-4 w-4" /> Upload End Photo</Button>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
        <div className="mt-8 text-center">
            <Button size="lg" className="w-full max-w-md bg-primary hover:bg-primary/90" onClick={handleConfirmBooking} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Confirming..." : "Confirm Booking"}
            </Button>
        </div>
    </div>
  );
}
