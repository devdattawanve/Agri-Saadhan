"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/agri/logo";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Loader2 } from "lucide-react";

const availableRoles = [
  { id: 'FARMER', label: 'Farmer' },
  { id: 'EQUIPMENT_OWNER', label: 'Equipment Owner' },
  { id: 'DRIVER', label: 'Driver' },
  { id: 'SAHAYAK', label: 'Sahayak (Agent)' }
];

export default function CompleteProfilePage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [roles, setRoles] = useState<string[]>([]);
    const [farmSize, setFarmSize] = useState("");
    const [detectedCoords, setDetectedCoords] = useState<{lat: number, lng: number} | null>(null);
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    const handleDetectLocation = async () => {
        setDetectingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setDetectedCoords({ lat: latitude, lng: longitude });
                toast({ title: "Location Detected!", description: "Fetching your address..." });

                try {
                    // Using Nominatim for reverse geocoding - no API key needed for this public service
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    if (data && data.address) {
                        const { village, town, city_district, state } = data.address;
                        const locationString = village || town || city_district || 'Unknown Area';
                        const finalLocation = `${locationString}, ${state}`;
                        setLocation(finalLocation);
                        toast({ title: "Address Found!", description: finalLocation });
                    } else {
                        toast({ variant: "destructive", title: "Address Not Found", description: "Could not find address. Please enter manually." });
                    }
                } catch (error) {
                    toast({ variant: "destructive", title: "Geocoding Failed", description: "Could not fetch address details." });
                    console.error("Reverse geocoding error:", error);
                } finally {
                    setDetectingLocation(false);
                }
            }, (error) => {
                toast({ variant: "destructive", title: "Location Error", description: "Could not get your location. Please enter it manually." });
                console.error("Geolocation error:", error);
                setDetectingLocation(false);
            });
        } else {
            toast({ variant: "destructive", title: "Unsupported", description: "Your browser does not support location detection." });
            setDetectingLocation(false);
        }
    };

    const handleGetStarted = async () => {
        if (!user || !name || !location || roles.length === 0) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all fields and select at least one role.",
            });
            return;
        }

        if (roles.includes('FARMER') && (!farmSize || Number(farmSize) <= 0)) {
             toast({
                variant: "destructive",
                title: "Invalid Farm Size",
                description: "Please enter a farm size greater than 0.",
            });
            return;
        }

        setLoading(true);
        try {
            const userDocRef = doc(firestore, "users", user.uid);
            const isSahayak = roles.includes('SAHAYAK');
            const userData = {
                id: user.uid,
                name: name,
                contactPhoneNumber: user.phoneNumber,
                villageTehsil: location,
                preferredLanguage: 'en', // default language
                roles: roles,
                sahayakStatus: isSahayak ? 'PENDING' : 'NONE',
                commissionRate: isSahayak ? 0.05 : 0, // Default 5% commission for sahayaks
                farmSizeInAcres: roles.includes('FARMER') ? Number(farmSize) : null,
                latitude: detectedCoords?.lat || 28.6139, // Use detected or mock Lat for Delhi
                longitude: detectedCoords?.lng || 77.2090, // Use detected or mock Lng for Delhi
                geohash: "ttnqq", // Mock geohash - in a real app, this would be calculated from lat/lng
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            
            setDocumentNonBlocking(userDocRef, userData, { merge: true });

            toast({
                title: "Profile Created!",
                description: "Welcome to Agri Saadhan!",
            });
            router.push("/dashboard");

        } catch (error: any) {
            console.error("Error creating profile:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error.message || "Could not save your profile.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="items-center">
                    <Logo />
                    <CardTitle className="font-headline pt-4">Just one last step</CardTitle>
                    <CardDescription>Tell us a bit about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                            id="name" 
                            placeholder="e.g. Ramesh Kumar"
                            value={name}
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Village / Tehsil</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="location" 
                                placeholder="e.g. Rampur, Hisar"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="flex-grow"
                            />
                            <Button variant="outline" size="icon" onClick={handleDetectLocation} aria-label="Detect Location" disabled={detectingLocation}>
                                {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                            </Button>
                        </div>
                         {detectedCoords && <p className="text-xs text-muted-foreground">Location captured: {detectedCoords.lat.toFixed(4)}, {detectedCoords.lng.toFixed(4)}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label>I am a...</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {availableRoles.map(role => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={role.id}
                                        checked={roles.includes(role.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setRoles(prev => [...prev, role.id]);
                                            } else {
                                                setRoles(prev => prev.filter(r => r !== role.id));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={role.id} className="font-normal">{role.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {roles.includes('FARMER') && (
                        <div className="space-y-2">
                            <Label htmlFor="farm-size">Farm Size (in Acres)</Label>
                            <Input
                                id="farm-size"
                                type="number"
                                placeholder="e.g. 10"
                                value={farmSize}
                                onChange={(e) => setFarmSize(e.target.value)}
                                min="0.1"
                                step="0.1"
                            />
                        </div>
                    )}

                    <Button 
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                        onClick={handleGetStarted}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Get Started"}
                    </Button>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <p className="text-sm font-bold text-muted-foreground">
                        🇮🇳 Made in India
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
