"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/agri/logo";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/agri/splash-screen";

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

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <SplashScreen />;
  }

  if (user) {
    return null; // prevent flashing
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
                  <Link href={`/login?lang=${lang.code}`}>
                    {lang.name}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}