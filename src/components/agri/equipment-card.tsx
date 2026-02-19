import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Clock } from "lucide-react";
import type { Equipment } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

export function EquipmentCard({ equipment, isOwner }: { equipment: Equipment; isOwner: boolean; }) {
  const searchParams = useSearchParams();
  const beneficiaryId = searchParams.get('beneficiaryId');
  
  const linkHref = beneficiaryId 
    ? `/booking/${equipment.id}?beneficiaryId=${beneficiaryId}`
    : `/booking/${equipment.id}`;

  const detailLinkHref = `/equipment/${equipment.id}${beneficiaryId ? `?beneficiaryId=${beneficiaryId}`: ''}`;

  const getDisplayPrice = () => {
    if (equipment.pricePerHour) {
      return { amount: equipment.pricePerHour, unit: 'hour' };
    }
    if (equipment.pricePerDay) {
      return { amount: equipment.pricePerDay, unit: 'day' };
    }
    return null;
  };

  const displayPrice = getDisplayPrice();

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group">
      <div className="flex-grow flex flex-col">
        <Link href={detailLinkHref} className="block flex-grow flex flex-col">
            <div className="relative">
              <Image
                src={equipment.imageUrl}
                alt={equipment.name}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint={equipment.imageHint}
              />
              {equipment.verified && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-accent/80 px-2 py-1 text-xs font-bold text-accent-foreground backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Panchayat Verified</span>
                </div>
              )}
            </div>
          <CardHeader>
            <CardTitle className="font-headline group-hover:text-primary transition-colors">{equipment.name}</CardTitle>
            <CardDescription>
              In {equipment.village}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {displayPrice ? (
                <span className="font-bold text-lg text-primary">
                  ₹{displayPrice.amount}
                  <span className="text-sm font-normal">/{displayPrice.unit}</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Price not set</span>
              )}
            </div>
          </CardContent>
        </Link>
      </div>
      <CardFooter>
         {isOwner ? (
            <Button variant="outline" className="w-full" disabled>Your own Equipment</Button>
         ) : (
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href={linkHref}>
                    Book Now
                </Link>
            </Button>
         )}
      </CardFooter>
    </Card>
  );
}
