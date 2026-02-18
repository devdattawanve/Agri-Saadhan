"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, MapPin, User, Truck, FileText, Tractor, IndianRupee } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Equipment } from "@/lib/data";

export default function EquipmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const beneficiaryId = searchParams.get('beneficiaryId');
  const firestore = useFirestore();

  const equipmentDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'equipment', id);
  }, [firestore, id]);

  const { data: equipment, isLoading } = useDoc<Equipment>(equipmentDocRef);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!equipment) {
    return (
        <div className="container mx-auto py-8 text-center">
            <Tractor className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="mt-4 text-3xl font-bold font-headline">Equipment Not Found</h1>
            <p className="text-muted-foreground">The equipment you are looking for does not exist or has been removed.</p>
            <Button asChild className="mt-6">
                <Link href="/equipment">Back to Marketplace</Link>
            </Button>
        </div>
    );
  }

  const bookingLink = beneficiaryId 
    ? `/booking/${equipment.id}?beneficiaryId=${beneficiaryId}`
    : `/booking/${equipment.id}`;


  return (
    <div className="container mx-auto py-8">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-full min-h-[300px]">
                <Image
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    fill
                    className="object-cover"
                    data-ai-hint={equipment.imageHint}
                />
                 {equipment.verified && (
                    <Badge variant="default" className="absolute top-4 left-4 bg-accent/90 text-accent-foreground backdrop-blur-sm">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Gram Panchayat Verified
                    </Badge>
                )}
            </div>
            <div className="flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{equipment.name}</CardTitle>
                    <CardDescription>
                        in {equipment.village}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold font-headline mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{equipment.description || "No description provided."}</p>
                    </div>
                    
                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{equipment.village}</span>
                      </div>
                       {equipment.driverChargePerHour && (
                         <div className="flex items-center gap-2 text-muted-foreground">
                             <User className="h-4 w-4" />
                             <span>Driver available</span>
                         </div>
                        )}
                        {equipment.deliveryFee && (
                         <div className="flex items-center gap-2 text-muted-foreground">
                             <Truck className="h-4 w-4" />
                             <span>Delivery available</span>
                         </div>
                        )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                        <h3 className="font-semibold font-headline mb-2">Pricing</h3>
                        <div className="space-y-2">
                            {equipment.price?.perHour && (
                                <div className="flex justify-between items-baseline">
                                  <span className="text-muted-foreground">Base Rate (per hour)</span>
                                  <p className="font-bold text-primary">₹{equipment.price.perHour}</p>
                                </div>
                            )}
                            {equipment.price?.perDay && (
                                <div className="flex justify-between items-baseline">
                                  <span className="text-muted-foreground">Base Rate (per day)</span>
                                  <p className="font-bold text-primary">₹{equipment.price.perDay}</p>
                                </div>
                            )}
                             {equipment.driverChargePerHour && (
                                <div className="flex justify-between items-baseline">
                                  <span className="text-muted-foreground">Driver Charge (per hour)</span>
                                  <p className="font-bold text-primary">₹{equipment.driverChargePerHour}</p>
                                </div>
                            )}
                             {equipment.deliveryFee && (
                                <div className="flex justify-between items-baseline">
                                  <span className="text-muted-foreground">Delivery Fee (flat)</span>
                                  <p className="font-bold text-primary">₹{equipment.deliveryFee}</p>
                                </div>
                            )}
                        </div>
                         {!equipment.price?.perHour && !equipment.price?.perDay && (
                             <p className="text-muted-foreground">Price available on request.</p>
                         )}
                    </div>
                </CardContent>
                <CardFooter className="mt-auto bg-muted/50 p-6">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90" asChild>
                        <Link href={bookingLink}>
                            <FileText className="mr-2 h-4 w-4" /> Request to Book
                        </Link>
                    </Button>
                </CardFooter>
            </div>
        </div>
      </Card>
    </div>
  );
}

const DetailPageSkeleton = () => (
    <div className="container mx-auto py-8">
        <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
                <Skeleton className="h-64 md:h-full min-h-[450px]" />
                <div className="flex flex-col p-6">
                    <Skeleton className="h-10 w-3/4 mb-4" />
                    <Skeleton className="h-5 w-1/2 mb-8" />

                    <Skeleton className="h-5 w-1/3 mb-4" />
                    <Skeleton className="h-5 w-1/3 mb-8" />
                    
                    <Separator className="my-4" />

                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-12 w-1/2 mb-auto" />
                    
                    <div className="mt-8 grid grid-cols-1 gap-4">
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </Card>
    </div>
);
