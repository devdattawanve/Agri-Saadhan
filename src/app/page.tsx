import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/agri/logo";

const languages = [
  { name: "English", code: "en" },
  { name: "हिन्दी", code: "hi" },
  { name: "मराठी", code: "mr" },
  { name: "తెలుగు", code: "te" },
  { name: "ਪੰਜਾਬੀ", code: "pa" },
  { name: "ગુજરાતી", code: "gu" },
];

export default function OnboardingPage() {
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
          <CardFooter className="flex-col gap-4 pt-6">
            <p className="text-sm font-bold text-muted-foreground">
              🇮🇳 Made in India
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Partner FPOs</span>
              <span>Partner Banks</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
