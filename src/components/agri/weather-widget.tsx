"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Sun, Thermometer } from "lucide-react";
import { useState, useEffect } from "react";

export function WeatherWidget() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Today's Weather</CardTitle>
        <p className="text-sm text-muted-foreground">{date || 'Loading...'}</p>
      </CardHeader>
      <CardContent className="flex items-center justify-around">
        <div className="flex flex-col items-center gap-2">
          <Sun className="h-10 w-10 text-yellow-500" />
          <p className="font-bold text-xl">32°C</p>
          <p className="text-sm text-muted-foreground">Sunny</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Thermometer className="h-10 w-10 text-red-500" />
          <p className="font-bold text-xl">42°C</p>
          <p className="text-sm text-muted-foreground">Max Temp</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CloudRain className="h-10 w-10 text-blue-500" />
          <p className="font-bold text-xl">10%</p>
          <p className="text-sm text-muted-foreground">Rain</p>
        </div>
      </CardContent>
    </Card>
  );
}
