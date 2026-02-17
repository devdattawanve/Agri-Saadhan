"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SahayakPage() {
    const firestore = useFirestore();
    const usersColRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);
    const { data: users, isLoading } = useCollection(usersColRef);

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Book for a Farmer</CardTitle>
                        <CardDescription>Select a farmer from the list below to start a booking on their behalf.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border rounded-md">
                            <div className="divide-y">
                                {isLoading && (
                                    <>
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                    </>
                                )}
                                {users && users.map(farmer => (
                                    <div key={farmer.id} className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-semibold">{farmer.name}</p>
                                            <p className="text-sm text-muted-foreground">{farmer.villageTehsil} - {farmer.contactPhoneNumber}</p>
                                        </div>
                                        <Button asChild>
                                            <Link href={`/dashboard?beneficiaryId=${farmer.id}`}>
                                                Book for this Farmer
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                                {users && users.length === 0 && !isLoading && (
                                    <div className="p-4 text-center text-muted-foreground">
                                        No other users found. Once other farmers sign up, they will appear here.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="font-headline">Commission Tracker</CardTitle>
                        <CardDescription className="text-primary-foreground/80">Your earnings this week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold">₹500</p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-primary-foreground/80">Updated just now.</p>
                    </CardFooter>
                 </Card>
            </div>
        </div>
    );
}
