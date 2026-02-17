"use client";
import { equipmentData } from "@/lib/data";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, CircleDashed } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const equipment = equipmentData.find((e) => e.id === params.id);

  if (!equipment) {
    notFound();
  }

  const handleConfirmBooking = () => {
    toast({
        title: "Booking Confirmed!",
        description: `Your booking for ${equipment.name} is confirmed.`,
    });
    router.push('/dashboard');
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold font-headline mb-6">Confirm Your Booking</h1>
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <Card>
                    <CardHeader className="flex flex-row items-start gap-4">
                        <Image src={equipment.image.imageUrl} alt={equipment.name} width={80} height={60} className="rounded-lg object-cover" />
                        <div>
                            <CardTitle className="font-headline">{equipment.name}</CardTitle>
                            <CardDescription>Price: ₹{equipment.price.amount}/{equipment.price.unit}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Payment Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup defaultValue="pay_on_delivery" className="space-y-4">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pay_on_delivery" id="r1" />
                                    <Label htmlFor="r1">Pay on Delivery</Label>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">Pay after the work is completed.</p>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="credit" id="r2" />
                                    <Label htmlFor="r2">Credit (via Sahayak)</Label>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">Available if linked to a Sahayak.</p>
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
            <Button size="lg" className="w-full max-w-md bg-primary hover:bg-primary/90" onClick={handleConfirmBooking}>
                Confirm Booking
            </Button>
        </div>
    </div>
  );
}
