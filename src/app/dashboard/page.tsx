"use client";

import { useState } from "react";
import { WeatherWidget } from "@/components/agri/weather-widget";
import { EquipmentCard } from "@/components/agri/equipment-card";
import { VoiceSearch } from "@/components/agri/voice-search";
import { equipmentData, Equipment } from "@/lib/data";
import type { VoiceEquipmentSearchOutput } from "@/ai/flows/voice-equipment-search";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>(equipmentData);
  const [isFiltered, setIsFiltered] = useState(false);

  const handleSearch = (filters: VoiceEquipmentSearchOutput | null) => {
    if (!filters) {
        setFilteredEquipment(equipmentData);
        setIsFiltered(false);
        return;
    }

    let equipment = [...equipmentData];
    if (filters.equipmentType && filters.equipmentType !== "General Farm Equipment") {
      equipment = equipment.filter(e => e.type.toLowerCase() === filters.equipmentType.toLowerCase());
    }
    
    setFilteredEquipment(equipment);
    setIsFiltered(true);
  };

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
        {filteredEquipment.map((item) => (
          <EquipmentCard key={item.id} equipment={item} />
        ))}
        {filteredEquipment.length === 0 && (
            <div className="col-span-full text-center py-10">
                <p className="text-lg text-muted-foreground">No equipment found matching your search.</p>
                <Button variant="link" onClick={() => handleSearch(null)} className="mt-2">View all equipment</Button>
            </div>
        )}
      </div>
      <VoiceSearch onSearch={handleSearch} />
    </>
  );
}
