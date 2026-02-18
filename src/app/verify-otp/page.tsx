"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/agri/logo";
import { useToast } from "@/hooks/use-toast";

export default function VerifyOtpPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyOtp = async () => {
        setLoading(true);
        if (window.confirmationResult) {
            try {
                const result = await window.confirmationResult.confirm(otp);
                const user = result.user;

                // Check if user profile exists
                const userDocRef = doc(firestore, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    router.push("/dashboard");
                } else {
                    router.push("/complete-profile");
                }
            } catch (error: any) {
                console.error("Error verifying OTP:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message || "Invalid OTP. Please try again.",
                });
            } finally {
                setLoading(false);
            }
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No OTP confirmation found. Please try logging in again.",
            });
            router.push('/login');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="items-center">
                    <Logo />
                    <CardTitle className="font-headline pt-4">Verify OTP</CardTitle>
                    <CardDescription>Enter the 6-digit code sent to your number</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">OTP</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="_ _ _ _ _ _"
                            className="text-center tracking-[0.5em]"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                        />
                    </div>
                    <Button 
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </Button>
                    <Button variant="link" className="w-full">Call Me for OTP</Button>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <p className="text-sm font-bold text-muted-foreground">
                        Made in India
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
