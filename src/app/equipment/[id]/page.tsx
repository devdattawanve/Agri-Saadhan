import { equipmentData } from "@/lib/data";
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
import { ShieldCheck, MapPin, Clock, Phone, FileText } from "lucide-react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const beneficiaryId = searchParams.get('beneficiaryId');

  const equipment = equipmentData.find((e) => e.id === params.id);

  if (!equipment) {
    notFound();
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
                    src={equipment.image.imageUrl}
                    alt={equipment.image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={equipment.image.imageHint}
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
                        Owned by {equipment.owner}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{equipment.village} ({equipment.distance}km away)</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Approx. {equipment.travelTime} mins by Tractor</span>
                    </div>
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
