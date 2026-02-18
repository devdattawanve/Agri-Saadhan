"use client";

import { useState } from "react";
import { WeatherWidget } from "@/components/agri/weather-widget";
import { EquipmentCard } from "@/components/agri/equipment-card";
import { VoiceSearch } from "@/components/agri/voice-search";
import type { Equipment } from "@/lib/data";
import type { VoiceEquipmentSearchOutput } from "@/ai/flows/voice-equipment-search";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function EquipmentPage() {
  const firestore = useFirestore();
  const equipmentColRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'equipment');
  }, [firestore]);

  const { data: allEquipment, isLoading } = useCollection<Equipment>(equipmentColRef);

  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[] | null>(null);
  const isFiltered = filteredEquipment !== null;

  const getEquipmentList = () => {
    return isFiltered ? filteredEquipment : allEquipment;
  }

  const handleSearch = (filters: VoiceEquipmentSearchOutput | null) => {
    if (!filters || !allEquipment) {
        setFilteredEquipment(null);
        return;
    }

    let equipment = [...allEquipment];
    if (filters.equipmentType && filters.equipmentType !== "General Farm Equipment") {
      equipment = equipment.filter(e => e.type.toLowerCase() === filters.equipmentType.toLowerCase());
    }
    
    setFilteredEquipment(equipment);
  };
  
  const equipmentList = getEquipmentList();

  return (
    <>
      <WeatherWidget />
      {isFiltered && (
          <div className="flex items-center justify-between">
              <h2 className="text-2xl font-headline font-bold">Search Results</h2>
              <Button variant="link" onClick={() => handleSearch(null)}>Clear Search</Button>
          </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && Array.from({length: 8}).map((_, i) => (
             <CardSkeleton key={i} />
        ))}
        {equipmentList && equipmentList.map((item) => (
          <EquipmentCard key={item.id} equipment={item} />
        ))}
        {!isLoading && equipmentList?.length === 0 && (
            <div className="col-span-full text-center py-10">
                <p className="text-lg text-muted-foreground">{isFiltered ? "No equipment found matching your search." : "No equipment available right now."}</p>
                {isFiltered && <Button variant="link" onClick={() => handleSearch(null)} className="mt-2">View all equipment</Button>}
            </div>
        )}
      </div>
      <VoiceSearch onSearch={handleSearch} />
    </>
  );
}


const CardSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="space-y-2 p-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
)
