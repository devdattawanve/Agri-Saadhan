"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, LinkIcon, UploadCloud } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const equipmentTypes = ["Tractor", "Rotavator", "Plow", "Harvester", "Sprayer", "General Farm Equipment"];

export default function AddEquipmentPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [village, setVillage] = useState("");
    const [pricePerHour, setPricePerHour] = useState("");
    const [pricePerDay, setPricePerDay] = useState("");
    
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) { // 1MB limit
                toast({
                    variant: "destructive",
                    title: "Image Too Large",
                    description: "Please upload an image smaller than 1MB.",
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setImageUrl(""); // Clear URL input if file is selected
            };
            reader.readAsDataURL(file);
        }
    };

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
        if (!name || !type || !village || (!pricePerHour && !pricePerDay)) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out name, type, village, and at least one price." });
            return;
        }

        setLoading(true);

        const defaultImage = PlaceHolderImages.find(img => img.id.includes(type.toLowerCase())) || PlaceHolderImages[0];
        const finalImageUrl = imagePreview || imageUrl || defaultImage.imageUrl;

        try {
            const equipmentColRef = collection(firestore, "equipment");
            await addDocumentNonBlocking(equipmentColRef, {
                name,
                type,
                description,
                village,
                price: {
                    perHour: pricePerHour ? Number(pricePerHour) : null,
                    perDay: pricePerDay ? Number(pricePerDay) : null,
                },
                ownerId: user.uid,
                verified: false,
                availabilityStatus: "available",
                latitude: coords?.lat || null,
                longitude: coords?.lng || null,
                geohash: "tbd", // To be calculated on the backend or with a library
                imageUrl: finalImageUrl,
                imageHint: defaultImage.imageHint, // Fallback hint
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Equipment Added!",
                description: `${name} has been listed for rent.`,
            });
            router.push("/my-equipment");

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

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe the equipment, its condition, and any special features." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                    <Label>Equipment Image</Label>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload from Device</TabsTrigger>
                            <TabsTrigger value="url">From URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload">
                            <div 
                                className="mt-2 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-muted rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleFileChange}
                                />
                                {imagePreview ? (
                                    <div className="relative w-48 h-32">
                                        <Image src={imagePreview} alt="Equipment preview" width={192} height={128} className="rounded-md object-cover" />
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="h-10 w-10 text-muted-foreground" />
                                        <p className="text-center text-sm text-muted-foreground">Click to upload</p>
                                        <p className="text-xs text-muted-foreground">(Max 1MB)</p>
                                    </>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="url">
                            <div className="flex gap-2 items-center pt-2">
                                <LinkIcon className="h-5 w-5 text-muted-foreground"/>
                                <Input 
                                    id="imageUrl" 
                                    type="url" 
                                    placeholder="https://... paste image link" 
                                    value={imageUrl} 
                                    onChange={(e) => {
                                        setImageUrl(e.target.value);
                                        setImagePreview(null);
                                    }} 
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

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

                <div>
                    <Label>Rental Price</Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                           <Input id="pricePerHour" type="number" placeholder="Price per hour" className="pl-6" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} />
                        </div>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                           <Input id="pricePerDay" type="number" placeholder="Price per day" className="pl-6" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} />
                        </div>
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