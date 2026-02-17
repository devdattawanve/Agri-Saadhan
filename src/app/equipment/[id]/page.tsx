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
import { ShieldCheck, MapPin, Clock, Phone, FileText, Tractor } from "lucide-react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Equipment } from "@/lib/data";

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const beneficiaryId = searchParams.get('beneficiaryId');
  const firestore = useFirestore();

  const equipmentDocRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'equipment', params.id);
  }, [firestore, params.id]);

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
                <Link href="/dashboard">Back to Marketplace</Link>
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
                        Owned by {equipment.owner} in {equipment.village}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {equipment.distance && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{equipment.village} ({equipment.distance}km away)</span>
                      </div>
                    )}
                    {equipment.travelTime && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Approx. {equipment.travelTime} mins by Tractor</span>
                      </div>
                    )}
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="font-semibold font-headline">Rental Price</h3>
                        <p className="text-3xl font-bold text-primary">
                            ₹{equipment.price.amount}
                            <span className="text-lg font-normal text-muted-foreground"> / {equipment.price.unit}</span>
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button size="lg" variant="outline"><Phone className="mr-2 h-4 w-4"/> Call Now</Button>
                    <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                        <Link href={bookingLink}>
                            <FileText className="mr-2 h-4 w-4" /> Book Now
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
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </Card>
    </div>
);
