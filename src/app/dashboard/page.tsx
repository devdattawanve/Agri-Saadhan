"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { WeatherWidget } from "@/components/agri/weather-widget";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { collection } from "firebase/firestore";
import type { Equipment } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function EquipmentSlider() {
    const firestore = useFirestore();
    const equipmentColRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'equipment');
    }, [firestore]);
    const { data: allEquipment, isLoading } = useCollection<Equipment>(equipmentColRef);

    const plugin = React.useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);

    React.useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap());

        const onSelect = () => {
          setCurrent(api.selectedScrollSnap());
        };

        api.on("select", onSelect);
        
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-lg bg-black/20" />;
    }

    if (!allEquipment || allEquipment.length === 0) {
        return null;
    }
    
    // Featuring some equipment
    const featuredEquipment = allEquipment.slice(0, 5); 

    return (
        <div className="relative">
            <Carousel 
                plugins={[plugin.current]} 
                className="w-full" 
                setApi={setApi}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{
                  loop: true,
                }}
            >
                <CarouselContent>
                    {featuredEquipment.map((equipment) => (
                        <CarouselItem key={equipment.id}>
                            <Link href={`/equipment/${equipment.id}`}>
                                <div className="overflow-hidden rounded-lg">
                                    <div className="relative aspect-video md:aspect-[2.4/1]">
                                        <Image
                                            src={equipment.imageUrl}
                                            alt={equipment.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-6">
                                            <h3 className="text-xl md:text-2xl font-bold text-white font-headline">{equipment.name}</h3>
                                            <p className="text-sm text-gray-200">{equipment.type} in {equipment.village}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {featuredEquipment.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => api?.scrollTo(i)}
                        className={cn(
                            "h-2 w-2 rounded-full transition-all",
                            current === i ? "w-4 bg-white" : "bg-white/50"
                        )}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  return (
    <div className="relative -m-4 -mb-20 md:-m-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://image2url.com/r2/default/images/1771521102799-94b27787-7f9f-4a3a-8442-2bf69073bf42.webp')",
        }}
      />
      <div className="relative z-10 p-4 pb-20 md:p-8 space-y-8">
        <WeatherWidget cardClassName="bg-black/40 backdrop-blur-sm border-white/10" />
        
        <EquipmentSlider />

        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-white">
              Welcome to Agri Saadhan
            </CardTitle>
            <CardDescription className="text-gray-200">
              Your central hub for all agricultural needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-100">
              This is your home page. Use the navigation to explore equipment,
              manage your bookings, and list your own equipment for rent.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
