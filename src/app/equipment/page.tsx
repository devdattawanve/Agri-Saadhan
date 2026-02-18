"use client";

import { useState, useMemo } from "react";
import { EquipmentCard } from "@/components/agri/equipment-card";
import { VoiceSearch } from "@/components/agri/voice-search";
import type { Equipment } from "@/lib/data";
import type { VoiceEquipmentSearchOutput } from "@/ai/flows/voice-equipment-search";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const equipmentTypes = ["Tractor", "Rotavator", "Plow", "Harvester", "Sprayer", "General Farm Equipment"];

export default function EquipmentPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const equipmentColRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'equipment');
  }, [firestore]);

  const { data: allEquipment, isLoading } = useCollection<Equipment>(equipmentColRef);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const equipmentList = useMemo(() => {
    if (!allEquipment) return [];
    
    let equipment = [...allEquipment];
    
    // Filter by selected equipment type
    if (selectedType) {
      equipment = equipment.filter(e => e.type === selectedType);
    }

    // Filter by search query (name)
    if (searchQuery) {
      equipment = equipment.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return equipment;
  }, [allEquipment, searchQuery, selectedType]);
  
  const handleVoiceSearch = (filters: VoiceEquipmentSearchOutput | null) => {
    if (!filters) {
        setSelectedType(null);
        setSearchQuery("");
        return;
    }

    if (filters.equipmentType && filters.equipmentType !== "General Farm Equipment") {
      setSelectedType(filters.equipmentType);
    } else {
      setSelectedType(null);
    }
    
    setSearchQuery(filters.keywords?.join(' ') || "");
  };

  const isFiltering = !!searchQuery || !!selectedType;

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="space-y-4 p-4 bg-card rounded-lg border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for tractors, rotavators, etc..."
            className="pl-10 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          <Button
            size="sm"
            variant={!selectedType ? "default" : "outline"}
            onClick={() => setSelectedType(null)}
          >
            All
          </Button>
          {equipmentTypes.map(type => (
            <Button
              size="sm"
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && Array.from({length: 8}).map((_, i) => (
             <CardSkeleton key={i} />
        ))}
        {equipmentList && equipmentList.map((item) => (
          <EquipmentCard key={item.id} equipment={item} isOwner={user?.uid === item.ownerId} />
        ))}
        {!isLoading && equipmentList?.length === 0 && (
            <div className="col-span-full text-center py-10">
                <p className="text-lg text-muted-foreground">{isFiltering ? "No equipment found matching your criteria." : "No equipment available right now."}</p>
                {isFiltering && <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedType(null); }} className="mt-2">Clear filters</Button>}
            </div>
        )}
      </div>
      <VoiceSearch onSearch={handleVoiceSearch} />
    </div>
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
