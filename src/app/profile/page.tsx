"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const availableRoles = [
  { id: 'FARMER', label: 'Farmer' },
  { id: 'EQUIPMENT_OWNER', label: 'Equipment Owner' },
  { id: 'DRIVER', label: 'Driver' },
  { id: 'SAHAYAK', label: 'Sahayak (Agent)' }
];

export default function ProfilePage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [roles, setRoles] = useState<string[]>([]);
    const [farmSize, setFarmSize] = useState("");
    const [detectedCoords, setDetectedCoords] = useState<{lat: number, lng: number} | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setName(userData.name || "");
            setLocation(userData.villageTehsil || "");
            setRoles(userData.roles || []);
            setFarmSize(userData.farmSizeInAcres?.toString() || "");
            if (userData.latitude && userData.longitude) {
                setDetectedCoords({ lat: userData.latitude, lng: userData.longitude });
            }
        }
    }, [userData]);


    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                setDetectedCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                toast({ title: "Location Detected!", description: "Your current location has been captured." });
            }, error => {
                toast({ variant: "destructive", title: "Location Error", description: "Could not get your location. Please enter it manually."});
                console.error("Geolocation error:", error);
            });
        } else {
            toast({ variant: "destructive", title: "Unsupported", description: "Your browser does not support location detection."});
        }
    }

    const handleSaveChanges = async () => {
        if (!userDocRef || !name || !location || roles.length === 0) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all fields and select at least one role.",
            });
            return;
        }

        if (roles.includes('FARMER') && !farmSize) {
             toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please enter your farm size.",
            });
            return;
        }

        setLoading(true);
        try {
            const isSahayak = roles.includes('SAHAYAK');
            // We only update fields, we don't want to overwrite existing values like sahayakStatus or commissionRate unless they are part of this form.
            const updatedData: any = {
                name: name,
                villageTehsil: location,
                roles: roles,
                farmSizeInAcres: roles.includes('FARMER') ? Number(farmSize) : null,
                latitude: detectedCoords?.lat,
                longitude: detectedCoords?.lng,
                // geohash would need to be recalculated, for now we leave it
                updatedAt: new Date().toISOString(),
            };

            // If a user becomes a Sahayak for the first time, set their status to PENDING
            if (isSahayak && userData?.sahayakStatus === 'NONE') {
                updatedData.sahayakStatus = 'PENDING';
                updatedData.commissionRate = 0.05; // Default 5%
            }
            
            setDocumentNonBlocking(userDocRef, updatedData, { merge: true });

            toast({
                title: "Profile Updated!",
                description: "Your information has been saved.",
            });
            router.push("/dashboard");

        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error.message || "Could not save your profile.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (isUserDocLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-20" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }


    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Your Profile</CardTitle>
                <CardDescription>Update your personal information and roles.</CardDescription>
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
                        <Button variant="outline" size="icon" onClick={handleDetectLocation} aria-label="Detect Location">
                            <MapPin className="h-4 w-4" />
                        </Button>
                    </div>
                        {detectedCoords && <p className="text-xs text-muted-foreground">Location captured: {detectedCoords.lat.toFixed(4)}, {detectedCoords.lng.toFixed(4)}</p>}
                </div>
                <div className="space-y-4">
                    <Label>Your Roles</Label>
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
                        />
                    </div>
                )}
            </CardContent>
             <CardFooter>
                <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    onClick={handleSaveChanges}
                    disabled={loading}
                >
                    {loading ? "Saving Changes..." : "Save Changes"}
                </Button>
            </CardFooter>
        </Card>
    );
}
