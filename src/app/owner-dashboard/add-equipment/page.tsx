"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";


const equipmentTypes = ["Tractor", "Rotavator", "Plow", "Harvester", "Sprayer", "General Farm Equipment"];
const priceUnits = ["hour", "day", "acre"];

export default function AddEquipmentPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [village, setVillage] = useState("");
    const [priceAmount, setPriceAmount] = useState("");
    const [priceUnit, setPriceUnit] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    const handleDetectLocation = () => {
        setDetectingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    toast({ title: "Location Detected!" });
                    setDetectingLocation(false);
                },
                (error) => {
                    toast({ variant: "destructive", title: "Location Error", description: "Could not get your location." });
                    console.error("Geolocation error:", error);
                    setDetectingLocation(false);
                }
            );
        } else {
            toast({ variant: "destructive", title: "Unsupported", description: "Geolocation is not supported by your browser." });
            setDetectingLocation(false);
        }
    };

    const handleAddEquipment = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Not logged in", description: "You must be logged in to add equipment." });
            return;
        }
        if (!name || !type || !village || !priceAmount || !priceUnit) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all the equipment details." });
            return;
        }

        setLoading(true);

        const defaultImage = PlaceHolderImages.find(img => img.id.includes(type.toLowerCase())) || PlaceHolderImages[0];

        try {
            const equipmentColRef = collection(firestore, "equipment");
            await addDocumentNonBlocking(equipmentColRef, {
                name,
                type,
                village,
                price: {
                    amount: Number(priceAmount),
                    unit: priceUnit,
                },
                ownerId: user.uid,
                verified: false,
                availabilityStatus: "available",
                latitude: coords?.lat || null,
                longitude: coords?.lng || null,
                geohash: "tbd", // To be calculated on the backend or with a library
                imageUrl: defaultImage.imageUrl,
                imageHint: defaultImage.imageHint,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Equipment Added!",
                description: `${name} has been listed for rent.`,
            });
            router.push("/owner-dashboard");

        } catch (error: any) {
            console.error("Error adding equipment:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not add equipment.",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">List New Equipment</CardTitle>
                <CardDescription>Fill in the details of your equipment to make it available for rent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Equipment Name</Label>
                        <Input id="name" placeholder="e.g. Swaraj 744 FE" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Equipment Type</Label>
                        <Select onValueChange={setType} value={type}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {equipmentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="village">Village / Location</Label>
                         <div className="flex gap-2">
                            <Input id="village" placeholder="e.g. Ramgarh" value={village} onChange={(e) => setVillage(e.target.value)} />
                            <Button variant="outline" size="icon" onClick={handleDetectLocation} disabled={detectingLocation}>
                                {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                            </Button>
                        </div>
                        {coords && <p className="text-xs text-green-600">Location captured successfully!</p>}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="priceAmount">Rental Price</Label>
                        <Input id="priceAmount" type="number" placeholder="e.g. 500" value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="priceUnit">Price Unit</Label>
                        <Select onValueChange={setPriceUnit} value={priceUnit}>
                            <SelectTrigger id="priceUnit">
                                <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {priceUnits.map(u => <SelectItem key={u} value={u}>per {u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button className="w-full" onClick={handleAddEquipment} disabled={loading || isUserLoading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Listing Equipment..." : "Add Equipment to Marketplace"}
                </Button>
            </CardContent>
        </Card>
    );
}
