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

export function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link href={`/equipment/${equipment.id}`}>
        <div className="relative">
          <Image
            src={equipment.image.imageUrl}
            alt={equipment.image.description}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={equipment.image.imageHint}
          />
          {equipment.verified && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-accent/80 px-2 py-1 text-xs font-bold text-accent-foreground backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Panchayat Verified</span>
            </div>
          )}
        </div>
      </Link>
      <CardHeader>
        <CardTitle className="font-headline">{equipment.name}</CardTitle>
        <CardDescription>
          Owner: {equipment.owner} ({equipment.village})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-bold text-lg text-primary">
                ₹{equipment.price.amount}
                <span className="text-sm font-normal">/{equipment.price.unit}</span>
            </span>
            <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>~{equipment.travelTime} mins away</span>
            </Badge>
        </div>
        <p className="text-sm">{equipment.distance} km from your location</p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Call Now
        </Button>
      </CardFooter>
    </Card>
  );
}
