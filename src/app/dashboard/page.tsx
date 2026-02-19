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
    <div className="relative -m-4 -mb-20 md:-m-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://image2url.com/r2/default/images/1771521102799-94b27787-7f9f-4a3a-8442-2bf69073bf42.webp')",
        }}
      />
      <div className="relative z-10 p-4 pb-20 md:p-8 space-y-8">
        <WeatherWidget cardClassName="bg-card/80 backdrop-blur-sm" />
        <Card className="bg-card/80 backdrop-blur-sm">
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
