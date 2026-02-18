"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/firebase";
import { WeatherWidget } from "@/components/agri/weather-widget";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  return (
    <div className="space-y-8">
        <WeatherWidget />
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Welcome to Agri Saadhan</CardTitle>
                <CardDescription>Your central hub for all agricultural needs.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is your home page. Use the navigation to explore equipment, manage your bookings, and list your own equipment for rent.</p>
            </CardContent>
        </Card>
    </div>
  );
}
