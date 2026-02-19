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
import { ShieldCheck, MapPin, FileText, Tractor, Tag, Info } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Equipment } from "@/lib/data";

interface UserProfile {
    name: string;
    [key: string]: any;
}

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

  const { data: equipment, isLoading: isEquipmentLoading } = useDoc<Equipment>(equipmentDocRef);

  const ownerDocRef = useMemoFirebase(() => {
    if (!firestore || !equipment?.ownerId) return null;
    return doc(firestore, 'users', equipment.ownerId);
  }, [firestore, equipment?.ownerId]);

  const { data: owner, isLoading: isOwnerLoading } = useDoc<UserProfile>(ownerDocRef);

  const isLoading = isEquipmentLoading || isOwnerLoading;

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

  const availabilityColor = equipment.availabilityStatus === 'available' ? 'bg-green-500' : 'bg-yellow-500';
  
  const eq = equipment as any;
  const pricePerHour = eq.pricePerHour ?? (eq.price?.unit === 'hour' ? eq.price.amount : null);
  const pricePerDay = eq.pricePerDay ?? (eq.price?.unit === 'day' ? eq.price.amount : null);

  return (
    <div className="container mx-auto py-8">
      <Card className="overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2">
            <div className="relative h-80 md:h-full min-h-[400px]">
                <Image
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    fill
                    className="object-cover"
                    data-ai-hint={equipment.imageHint}
                />
            </div>
            <div className="flex flex-col">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <CardTitle className="font-headline text-3xl">{equipment.name}</CardTitle>
                            <CardDescription className="mt-2">
                                By {owner?.name || 'Anonymous'} in {equipment.village}
                            </CardDescription>
                        </div>
                         {equipment.verified && (
                            <Badge variant="default" className="bg-accent/90 text-accent-foreground backdrop-blur-sm whitespace-nowrap">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Panchayat Verified
                            </Badge>
                        )}
                    </div>
                     <div className="flex flex-wrap gap-2 pt-4">
                        <Badge variant="secondary">{equipment.type}</Badge>
                        <Badge variant="outline" className={`${availabilityColor} text-white border-transparent`}>
                            {equipment.availabilityStatus.charAt(0).toUpperCase() + equipment.availabilityStatus.slice(1)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold font-headline mb-2 flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Description</h3>
                        <p className="text-sm text-muted-foreground">{equipment.description || "No description provided."}</p>
                    </div>
                    
                    <Separator />

                     <div>
                        <h3 className="font-semibold font-headline mb-4 flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />Details</h3>
                         <div className="flex items-start gap-2 text-muted-foreground text-sm">
                              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                              <span>{equipment.village}</span>
                          </div>
                    </div>

                    <Separator />
                    
                    <div>
                        <h3 className="font-semibold font-headline mb-4 flex items-center gap-2">Pricing</h3>
                        <div className="space-y-2">
                            {pricePerHour && (
                                <div className="flex justify-between items-baseline text-sm">
                                  <span className="text-muted-foreground">Per Hour</span>
                                  <p className="font-semibold">Rs. {pricePerHour}</p>
                                </div>
                            )}
                            {pricePerDay && (
                                <div className="flex justify-between items-baseline text-sm">
                                  <span className="text-muted-foreground">Per Day</span>
                                  <p className="font-semibold">Rs. {pricePerDay}</p>
                                </div>
                            )}
                         </div>
                         {!pricePerHour && !pricePerDay && (
                             <p className="text-muted-foreground text-sm">Price available on request.</p>
                         )}
                    </div>
                </CardContent>
                <CardFooter className="mt-auto bg-muted/50 p-6">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90" asChild disabled={equipment.availabilityStatus !== 'available'}>
                        <Link href={bookingLink}>
                            <FileText className="mr-2 h-4 w-4" /> 
                            {equipment.availabilityStatus === 'available' ? 'Request to Book' : 'Currently Unavailable'}
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
        <Card className="overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
                <Skeleton className="h-80 md:h-full min-h-[500px]" />
                <div className="flex flex-col p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-4/5" />
                    </div>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-24" />
                         <div className="space-y-2">
                             <Skeleton className="h-5 w-full" />
                             <Skeleton className="h-5 w-full" />
                         </div>
                    </div>
                     <div className="mt-auto pt-6">
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </Card>
    </div>
);