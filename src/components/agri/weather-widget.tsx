"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { CloudRain, Sun, Thermometer, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import Link from 'next/link';

interface WeatherData {
    temp: number;
    description: string;
    maxTemp: number;
    rainChance: number;
    locationName: string;
}

export function WeatherWidget() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [date, setDate] = useState("");
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userData } = useDoc(userDocRef);

    useEffect(() => {
        setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!userData || (!userData.latitude || !userData.longitude)) {
                // Mock data if no location
                setTimeout(() => {
                    setWeather({
                        temp: 32,
                        description: "Sunny",
                        maxTemp: 42,
                        rainChance: 10,
                        locationName: "Delhi" // default location
                    });
                    setLoading(false);
                }, 1500);
                return;
            }

            setLoading(true);
            const { latitude, longitude, villageTehsil } = userData;
            
            // In a real app, you would use a weather API.
            // Here we simulate the API call to show dynamic data.
            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Generate semi-random but plausible weather data
                const seed = (latitude + longitude) % 1;
                const temp = Math.floor(25 + seed * 15); // Temp between 25 and 40
                const maxTemp = temp + Math.floor(seed * 5);
                const rainChance = Math.floor(seed * 50);
                const isSunny = rainChance < 20;

                setWeather({
                    temp,
                    description: isSunny ? "Sunny" : "Cloudy",
                    maxTemp,
                    rainChance,
                    locationName: villageTehsil.split(',')[0] || "Your Location"
                });
                
            } catch (error) {
                console.error("Failed to fetch weather data", error);
                // Fallback to mock data on error
                 setWeather({
                    temp: 32,
                    description: "Sunny",
                    maxTemp: 42,
                    rainChance: 10,
                    locationName: "Delhi"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [userData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">
                    {loading ? <Skeleton className="h-6 w-32" /> : `Weather in ${weather?.locationName || 'your area'}`}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{date || <Skeleton className="h-4 w-40" />}</p>
            </CardHeader>
            <CardContent className="flex items-center justify-around">
                {loading ? (
                    <>
                        <div className="flex flex-col items-center gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-6 w-10" /><Skeleton className="h-4 w-12" /></div>
                        <div className="flex flex-col items-center gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-6 w-10" /><Skeleton className="h-4 w-16" /></div>
                        <div className="flex flex-col items-center gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-6 w-10" /><Skeleton className="h-4 w-8" /></div>
                    </>
                ) : weather ? (
                    <>
                        <div className="flex flex-col items-center gap-2">
                            {weather.description === 'Sunny' ? <Sun className="h-10 w-10 text-yellow-500" /> : <CloudRain className="h-10 w-10 text-blue-400" /> }
                            <p className="font-bold text-xl">{weather.temp}°C</p>
                            <p className="text-sm text-muted-foreground">{weather.description}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Thermometer className="h-10 w-10 text-red-500" />
                            <p className="font-bold text-xl">{weather.maxTemp}°C</p>
                            <p className="text-sm text-muted-foreground">Max Temp</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <CloudRain className="h-10 w-10 text-blue-500" />
                            <p className="font-bold text-xl">{weather.rainChance}%</p>
                            <p className="text-sm text-muted-foreground">Rain</p>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground py-4">
                        <MapPin className="h-8 w-8" />
                        <p>Could not fetch weather.</p>
                        <p className="text-xs">Please set your location in your <Link href="/profile" className="underline text-primary">profile</Link>.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
