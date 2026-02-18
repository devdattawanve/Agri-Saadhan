"use client";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Truck, Calendar as CalendarIcon, Tractor } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp, query, where } from "firebase/firestore";
import type { Equipment, Booking } from "@/lib/data";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, differenceInHours, startOfDay } from 'date-fns';
import { DateRange } from "react-day-picker";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function BookingPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    // Form State
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [requiresDriver, setRequiresDriver] = useState(false);
    const [pickupType, setPickupType] = useState<'SELF_PICKUP' | 'OWNER_DELIVERY'>('SELF_PICKUP');
    
    const [costs, setCosts] = useState({ baseRate: 0, driverCharge: 0, deliveryCharge: 0, totalAmount: 0, durationHours: 0 });
    const [loading, setLoading] = useState(false);

    const beneficiaryId = searchParams.get('beneficiaryId');
    const isSahayakBooking = !!beneficiaryId;

    const equipmentDocRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'equipment', id) : null, [firestore, id]);
    const { data: equipment, isLoading: isEquipmentLoading } = useDoc<Equipment>(equipmentDocRef);

    const bookingsQuery = useMemoFirebase(() => firestore && id ? query(collection(firestore, 'bookings'), where('equipmentId', '==', id), where('status', '==', 'confirmed')) : null, [firestore, id]);
    const { data: existingBookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

    const disabledDates = useMemo(() => {
        const dates: (Date | { from: Date; to: Date; })[] = [{ before: startOfDay(new Date()) }];
        existingBookings?.forEach(booking => {
            if (booking.startDate?.toDate && booking.endDate?.toDate) {
                dates.push({ from: booking.startDate.toDate(), to: booking.endDate.toDate() });
            }
        });
        return dates;
    }, [existingBookings]);
    
    useEffect(() => {
        if (equipment && date?.from && date?.to) {
            const hours = differenceInHours(date.to, date.from);
            if (hours <= 0) {
                setCosts({ baseRate: 0, driverCharge: 0, deliveryCharge: 0, totalAmount: 0, durationHours: 0 });
                return;
            };

            const baseRate = (equipment.price.perHour || 0) * hours;
            const driverCharge = requiresDriver ? (equipment.driverChargePerHour || 0) * hours : 0;
            const deliveryCharge = pickupType === 'OWNER_DELIVERY' ? (equipment.deliveryFee || 0) : 0;
            const totalAmount = baseRate + driverCharge + deliveryCharge;
            setCosts({ baseRate, driverCharge, deliveryCharge, totalAmount, durationHours: hours });
        } else {
             setCosts({ baseRate: 0, driverCharge: 0, deliveryCharge: 0, totalAmount: 0, durationHours: 0 });
        }
    }, [equipment, date, requiresDriver, pickupType]);


    const handleRequestBooking = async () => {
        if (!user || !firestore || !equipment || !date?.from || !date?.to) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please select a valid date range to make a booking." });
            return;
        }
        if (costs.totalAmount <= 0) {
            toast({ variant: "destructive", title: "Invalid Duration", description: "The booking duration must be at least one hour." });
            return;
        }
        setLoading(true);

        const bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any } = {
            equipmentId: id,
            ownerId: equipment.ownerId,
            createdBy: user.uid,
            beneficiary: isSahayakBooking && beneficiaryId ? beneficiaryId : user.uid,
            sahayakId: isSahayakBooking ? user.uid : undefined,

            status: 'pending',
            startDate: date.from,
            endDate: date.to,
            requiresDriver,
            pickupType,

            baseRate: costs.baseRate,
            driverCharge: costs.driverCharge,
            deliveryCharge: costs.deliveryCharge,
            totalAmount: costs.totalAmount,
            
            paymentStatus: 'pending',

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        try {
            const bookingsColRef = collection(firestore, 'bookings');
            // Explicitly create the document first. This triggers the 'create' security rule.
            const newDocRef = await addDocumentNonBlocking(bookingsColRef, bookingData);
            
            // Now update the document with its own ID. This triggers the 'update' security rule.
            await setDocumentNonBlocking(newDocRef, { id: newDocRef.id }, { merge: true });
            
            toast({
                title: "Booking Requested!",
                description: "The equipment owner has been notified. You can track the status in 'My Bookings'.",
            });
            router.push('/my-bookings');

        } catch (error: any) {
            console.error("Booking failed:", error);
            toast({
                variant: "destructive",
                title: "Booking Failed",
                description: error.message || "There was a problem with your booking request.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (isEquipmentLoading || areBookingsLoading) {
        return <div className="container mx-auto py-8 max-w-4xl"><Skeleton className="h-96 w-full" /></div>;
    }

    if (!equipment) {
        return (
            <div className="container mx-auto py-8 max-w-4xl text-center">
                <Tractor className="h-24 w-24 mx-auto text-muted-foreground" />
                <h1 className="mt-4 text-3xl font-bold font-headline">Equipment Not Found</h1>
                <p className="text-muted-foreground">The equipment you are trying to book does not exist or has been removed.</p>
                <Button asChild className="mt-6">
                    <Link href="/equipment">Back to Marketplace</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold font-headline mb-6">Request to Book</h1>
            
            <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-start">
                <div className="space-y-8">
                     <Card className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                            <div className="relative h-48 w-full sm:w-1/3 flex-shrink-0">
                                <Image src={equipment.imageUrl} alt={equipment.name} layout="fill" className="object-cover" />
                            </div>
                            <div className="p-6">
                                <CardTitle className="font-headline text-2xl">{equipment.name}</CardTitle>
                                <CardDescription className="mt-2 text-sm">
                                    {equipment.description || 'No description provided.'}
                                </CardDescription>
                                <div className="mt-4 space-y-2">
                                    <h4 className="font-semibold">Pricing</h4>
                                    {equipment.price.perHour && <p className="text-sm text-muted-foreground">Per Hour: ₹{equipment.price.perHour}</p>}
                                    {equipment.price.perDay && <p className="text-sm text-muted-foreground">Per Day: ₹{equipment.price.perDay}</p>}
                                    {equipment.driverChargePerHour && <p className="text-sm text-muted-foreground">Driver Charge: ₹{equipment.driverChargePerHour}/hr</p>}
                                    {equipment.deliveryFee && <p className="text-sm text-muted-foreground">Delivery Fee: ₹{equipment.deliveryFee} (flat)</p>}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">1. Select Booking Duration</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                    date.to ? (
                                        <>
                                        {format(date.from, "LLL dd, y HH:mm")} -{" "}
                                        {format(date.to, "LLL dd, y HH:mm")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y HH:mm")
                                    )
                                    ) : (
                                    <span>Pick a date range</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                    disabled={disabledDates}
                                />
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">2. Select Add-ons</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="requires-driver" className="font-semibold flex items-center gap-2"><User />Request a Driver</Label>
                                    <p className="text-xs text-muted-foreground">An experienced driver will operate the equipment.</p>
                                </div>
                                <Switch id="requires-driver" checked={requiresDriver} onCheckedChange={setRequiresDriver} disabled={!equipment.driverChargePerHour} />
                            </div>
                            <Separator />
                             <div>
                                <Label className="font-semibold flex items-center gap-2 mb-3"><Truck/>Pickup Type</Label>
                                <RadioGroup value={pickupType} onValueChange={(val) => setPickupType(val as any)} className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="SELF_PICKUP" id="r1" />
                                        <Label htmlFor="r1">Self Pickup</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="OWNER_DELIVERY" id="r2" disabled={!equipment.deliveryFee} />
                                        <Label htmlFor="r2" className={!equipment.deliveryFee ? 'text-muted-foreground' : ''}>Owner Delivery</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Base Rate ({costs.durationHours} hrs)</span>
                            <span className="font-medium">₹{costs.baseRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Driver Charge</span>
                            <span className="font-medium">₹{costs.driverCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Delivery Fee</span>
                            <span className="font-medium">₹{costs.deliveryCharge.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{costs.totalAmount.toFixed(2)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button size="lg" className="w-full bg-primary hover:bg-primary/90" onClick={handleRequestBooking} disabled={loading || costs.totalAmount <= 0}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Request Booking"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
