"use client";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar as CalendarIcon, Clock, Sun } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import type { Equipment, Booking } from "@/lib/data";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, differenceInCalendarDays, addHours, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from "react-day-picker";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Tractor } from "lucide-react";

export default function BookingPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const [bookingType, setBookingType] = useState<'hourly' | 'daily'>('hourly');
    const [hourlyDuration, setHourlyDuration] = useState(1);
    const [hourlyDate, setHourlyDate] = useState<Date | undefined>(new Date());
    const [dailyDate, setDailyDate] = useState<DateRange | undefined>(undefined);
    
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(false);

    const beneficiaryId = searchParams.get('beneficiaryId');
    const isSahayakBooking = !!beneficiaryId;

    const equipmentDocRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'equipment', id) : null, [firestore, id]);
    const { data: equipment, isLoading: isEquipmentLoading } = useDoc<Equipment>(equipmentDocRef);

    useEffect(() => {
        if (!equipment) return;
        if (bookingType === 'hourly' && hourlyDate && hourlyDuration > 0) {
            const price = (equipment.pricePerHour || 0) * hourlyDuration;
            setTotalPrice(price);
        } else if (bookingType === 'daily' && dailyDate?.from && dailyDate?.to) {
            const days = differenceInCalendarDays(dailyDate.to, dailyDate.from) + 1;
            if (days > 0) {
                const price = (equipment.pricePerDay || 0) * days;
                setTotalPrice(price);
            } else {
                setTotalPrice(0);
            }
        } else {
            setTotalPrice(0);
        }
    }, [equipment, bookingType, hourlyDuration, hourlyDate, dailyDate]);

    const handleRequestBooking = async () => {
        if (!user || !firestore || !equipment || totalPrice <= 0) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all booking details correctly." });
            return;
        }
        setLoading(true);

        const creator = user.uid;
        const farmer = isSahayakBooking && beneficiaryId ? beneficiaryId : user.uid;
        const owner = equipment.ownerId;
        const participants = [...new Set([owner, creator, farmer])];

        let bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any };
        
        if (bookingType === 'hourly' && hourlyDate && hourlyDuration > 0) {
            const startDate = hourlyDate;
            const endDate = addHours(startDate, hourlyDuration);
            bookingData = {
                equipmentId: id, equipmentName: equipment.name, equipmentImageUrl: equipment.imageUrl, ownerId: equipment.ownerId,
                farmerId: farmer, createdBy: creator, participants, status: 'pending', bookingType: 'hourly',
                startDate, endDate, duration: hourlyDuration, totalPrice,
                createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
            };
        } else if (bookingType === 'daily' && dailyDate?.from && dailyDate?.to) {
            const durationInDays = differenceInCalendarDays(dailyDate.to, dailyDate.from) + 1;
            bookingData = {
                equipmentId: id, equipmentName: equipment.name, equipmentImageUrl: equipment.imageUrl, ownerId: equipment.ownerId,
                farmerId: farmer, createdBy: creator, participants, status: 'pending', bookingType: 'daily',
                startDate: startOfDay(dailyDate.from), endDate: endOfDay(dailyDate.to), duration: durationInDays, totalPrice,
                createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
            };
        } else {
            toast({ variant: "destructive", title: "Invalid Booking Details" });
            setLoading(false);
            return;
        }

        try {
            const newDocRef = await addDocumentNonBlocking(collection(firestore, 'bookings'), bookingData);
            await setDocumentNonBlocking(newDocRef, { id: newDocRef.id }, { merge: true });
            toast({ title: "Booking Request Sent", description: "The owner has been notified." });
            router.push('/my-bookings');
        } catch (error: any) {
            console.error("Booking failed:", error);
            toast({ variant: "destructive", title: "Booking Failed", description: error.message || "There was a problem with your booking request." });
        } finally {
            setLoading(false);
        }
    };
    
    if (isEquipmentLoading) return <div className="container mx-auto py-8 max-w-4xl"><Skeleton className="h-96 w-full" /></div>;
    if (!equipment) return (
        <div className="container mx-auto py-8 max-w-4xl text-center">
            <Tractor className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="mt-4 text-3xl font-bold font-headline">Equipment Not Found</h1>
            <p className="text-muted-foreground">The equipment you are trying to book does not exist.</p>
            <Button asChild className="mt-6"><Link href="/equipment">Back to Marketplace</Link></Button>
        </div>
    );

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold font-headline mb-6">Request to Book</h1>
            <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-start">
                <div className="space-y-8">
                     <Card>
                        <div className="flex flex-col sm:flex-row">
                            <div className="relative h-48 w-full sm:w-1/3 flex-shrink-0"><Image src={equipment.imageUrl} alt={equipment.name} layout="fill" className="object-cover" /></div>
                            <div className="p-6">
                                <CardTitle className="font-headline text-2xl">{equipment.name}</CardTitle>
                                <div className="mt-4 space-y-2">
                                    <h4 className="font-semibold">Pricing</h4>
                                    {equipment.pricePerHour && <p className="text-sm text-muted-foreground">Per Hour: ₹{equipment.pricePerHour}</p>}
                                    {equipment.pricePerDay && <p className="text-sm text-muted-foreground">Per Day: ₹{equipment.pricePerDay}</p>}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="font-headline text-xl">1. Select Booking Type</CardTitle></CardHeader>
                        <CardContent>
                            <RadioGroup value={bookingType} onValueChange={(v) => setBookingType(v as any)} className="flex gap-8">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="hourly" id="hourly" /><Label htmlFor="hourly">Hourly</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="daily" id="daily" /><Label htmlFor="daily">Daily</Label></div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="font-headline text-xl">2. Select Date & Duration</CardTitle></CardHeader>
                        <CardContent>
                            {bookingType === 'hourly' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !hourlyDate && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {hourlyDate ? format(hourlyDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={hourlyDate} onSelect={setHourlyDate} disabled={{ before: new Date() }} initialFocus /></PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hours">Duration (hours)</Label>
                                            <Input id="hours" type="number" value={hourlyDuration} onChange={(e) => setHourlyDuration(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                                        </div>
                                    </div>
                                    {!equipment.pricePerHour && <p className="text-sm text-destructive">This equipment does not offer hourly rates.</p>}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Label>Select Date Range</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dailyDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dailyDate?.from ? (dailyDate.to ? <>{format(dailyDate.from, "LLL dd, y")} - {format(dailyDate.to, "LLL dd, y")}</> : format(dailyDate.from, "LLL dd, y")) : <span>Pick a date range</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dailyDate?.from} selected={dailyDate} onSelect={setDailyDate} numberOfMonths={2} disabled={{ before: new Date() }} /></PopoverContent>
                                    </Popover>
                                    {!equipment.pricePerDay && <p className="text-sm text-destructive">This equipment does not offer daily rates.</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="sticky top-24">
                    <CardHeader><CardTitle className="font-headline text-xl">Booking Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Booking Type</span>
                            <span className="font-medium capitalize">{bookingType}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button size="lg" className="w-full bg-primary hover:bg-primary/90" onClick={handleRequestBooking} disabled={loading || totalPrice <= 0}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Request Booking"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}