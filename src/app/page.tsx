"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/agri/logo";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/agri/splash-screen";
import { SecondarySplashScreen } from "@/components/agri/secondary-splash-screen";

const languages = [
  { name: "English", code: "en" },
  { name: "हिन्दी", code: "hi" },
  { name: "मराठी", code: "mr" },
  { name: "తెలుగు", code: "te" },
  { name: "ਪੰਜਾਬੀ", code: "pa" },
  { name: "ગુજરાતી", code: "gu" },
];

export default function OnboardingPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [splashStep, setSplashStep] = useState(0); // 0: Logo, 1: Image, 2: Content

  useEffect(() => {
    if (splashStep === 0) {
      const timer = setTimeout(() => {
        setSplashStep(1); // Move to the secondary splash screen
      }, 2000); // Show logo splash for 2 seconds
      return () => clearTimeout(timer);
    }
    if (splashStep === 1) {
      const timer = setTimeout(() => {
        setSplashStep(2); // Move to the main content
      }, 3000); // Show image splash for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [splashStep]);

  useEffect(() => {
    // Redirect only when splash screens are done (step 2)
    if (splashStep === 2 && !isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router, splashStep]);

  if (splashStep === 0) {
    return <SplashScreen />;
  }

  if (splashStep === 1) {
    return <SecondarySplashScreen />;
  }

  if (isUserLoading || (splashStep === 2 && user)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="items-center">
            <Logo />
            <p className="text-muted-foreground pt-2 text-center">
              Choose your preferred language to continue
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {languages.map((lang) => (
                <Button key={lang.code} variant="outline" asChild>
                  <Link href="/login">{lang.name}</Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
