"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Sun, ThermometerSun, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import Image from "next/image";

interface WeatherData {
    temp: number;
    description: string;
    maxTemp: number;
    rainChance: number;
    locationName: string;
}

export function WeatherWidget({ cardClassName }: { cardClassName?: string }) {
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
        <Card className={cn("text-white", cardClassName)}>
            <CardHeader>
                <CardTitle className="font-headline text-lg">
                    {loading ? <Skeleton className="h-6 w-32 bg-current opacity-20" /> : `Weather in ${weather?.locationName || 'your area'}`}
                </CardTitle>
                {date ? (
                    <p className="text-sm opacity-90">{date}</p>
                ) : (
                    <Skeleton className="h-4 w-40 mt-1 bg-current opacity-20" />
                )}
            </CardHeader>
            <CardContent className="flex items-center justify-around">
                {loading ? (
                    <>
                        <div className="flex flex-col items-center gap-2"><Skeleton className="h-10 w-10 rounded-full bg-current opacity-20" /><Skeleton className="h-6 w-10 bg-current opacity-20" /><Skeleton className="h-4 w-12 bg-current opacity-20" /></div>
                        <div className="flex flex-col items-center gap-2"><Skeleton className="h-10 w-10 rounded-full bg-current opacity-20" /><Skeleton className="h-6 w-10 bg-current opacity-20" /><Skeleton className="h-4 w-16 bg-current opacity-20" /></div>
                        <div className="flex flex-col items-center gap-2"><Skeleton className="h-10 w-10 rounded-full bg-current opacity-20" /><Skeleton className="h-6 w-10 bg-current opacity-20" /><Skeleton className="h-4 w-8 bg-current opacity-20" /></div>
                    </>
                ) : weather ? (
                    <>
                        <div className="flex flex-col items-center gap-2">
                            {weather.description === 'Sunny' ? <Sun className="h-10 w-10 text-yellow-400" /> : <Image src="https://image2url.com/r2/default/images/1771591951503-a3af9090-5ecc-45e9-abf8-227f15f6c76f.png" alt="Cloudy" width={40} height={40} className="w-10 h-10" /> }
                            <p className="font-bold text-xl">{weather.temp}°C</p>
                            <p className="text-sm opacity-90">{weather.description}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <ThermometerSun className="h-10 w-10 text-red-400" />
                            <p className="font-bold text-xl">{weather.maxTemp}°C</p>
                            <p className="text-sm opacity-90">Max Temp</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Image src="https://image2url.com/r2/default/images/1771592111717-ac8d54f6-aee5-4fb5-b0f6-85e2ef15501b.jpeg" alt="Rain chance" width={40} height={40} className="w-10 h-10" />
                            <p className="font-bold text-xl">{weather.rainChance}%</p>
                            <p className="text-sm opacity-90">Rain</p>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center py-4">
                        <MapPin className="h-8 w-8" />
                        <p>Could not fetch weather.</p>
                        <p className="text-xs">Please set your location in your <Link href="/profile" className="underline text-primary">profile</Link>.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
