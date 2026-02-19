"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser, useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
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
import { Skeleton } from "@/components/ui/skeleton";

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
    
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

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
                setImageUrl(""); 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDetectLocation = () => {
        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                toast({ title: "Location Detected!", description: "Fetching address..." });

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    if (data && data.address) {
                        const { road, suburb, neighbourhood, village, town, city, county, state, postcode } = data.address;
                        
                        const area = suburb || neighbourhood || village || road || 'Unknown Area';
                        const cityOrTown = city || town || '';
                        const district = county || '';
                        const pin = postcode || '';
                        
                        const addressParts = [area, cityOrTown, district, state, pin].filter(part => part);
                        const finalLocation = addressParts.join(', ');

                        setVillage(finalLocation);
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
            },
            (error) => {
                toast({ variant: "destructive", title: "Location Error", description: "Could not get your location." });
                setDetectingLocation(false);
            }
        );
    };

    const handleAddEquipment = async () => {
        if (!user || !name || !type || !village || (!pricePerHour && !pricePerDay)) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out name, type, village, and at least one price." });
            return;
        }

        setLoading(true);

        const defaultImage = PlaceHolderImages.find(img => img.id.includes(type.toLowerCase())) || PlaceHolderImages[0];
        const finalImageUrl = imagePreview || imageUrl || defaultImage.imageUrl;

        try {
            const equipmentColRef = collection(firestore, "equipment");
            const newDocRef = await addDocumentNonBlocking(equipmentColRef, {
                name, type, description, village,
                pricePerHour: pricePerHour ? Number(pricePerHour) : null,
                pricePerDay: pricePerDay ? Number(pricePerDay) : null,
                ownerId: user.uid,
                verified: false,
                availabilityStatus: "available",
                latitude: coords?.lat || null,
                longitude: coords?.lng || null,
                geohash: "tbd",
                imageUrl: finalImageUrl,
                imageHint: defaultImage.imageHint,
                createdAt: serverTimestamp(),
            });
            await setDocumentNonBlocking(newDocRef, { id: newDocRef.id }, { merge: true });

            toast({ title: "Equipment Added!", description: `${name} has been listed for rent.` });
            router.push("/my-equipment");

        } catch (error: any) {
            console.error("Error adding equipment:", error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Could not add equipment." });
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return <Skeleton className="w-full max-w-2xl mx-auto h-screen" />;

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
                            <SelectTrigger id="type"><SelectValue placeholder="Select a type" /></SelectTrigger>
                            <SelectContent>{equipmentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe the equipment, its condition, etc." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                    <Label>Equipment Image</Label>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="upload">Upload</TabsTrigger><TabsTrigger value="url">From URL</TabsTrigger></TabsList>
                        <TabsContent value="upload">
                            <div className="mt-2 flex flex-col items-center justify-center space-y-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/50" onClick={() => fileInputRef.current?.click()}>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                {imagePreview ? <Image src={imagePreview} alt="Preview" width={192} height={128} className="rounded-md object-cover" /> : <><UploadCloud className="h-10 w-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">Click to upload (Max 1MB)</p></>}
                            </div>
                        </TabsContent>
                        <TabsContent value="url">
                            <div className="flex gap-2 items-center pt-2">
                                <LinkIcon className="h-5 w-5 text-muted-foreground"/>
                                <Input id="imageUrl" type="url" placeholder="https://... paste image link" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(null); }} />
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
                    {coords && <p className="text-xs text-green-600">Location captured!</p>}
                </div>

                <div>
                    <Label>Rental Price</Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs.</span><Input id="pricePerHour" type="number" placeholder="Price per hour" className="pl-9" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} /></div>
                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs.</span><Input id="pricePerDay" type="number" placeholder="Price per day" className="pl-9" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} /></div>
                    </div>
                </div>

                <Button className="w-full" onClick={handleAddEquipment} disabled={loading || isUserLoading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Listing...</> : "Add Equipment to Marketplace"}
                </Button>
            </CardContent>
        </Card>
    );
}
