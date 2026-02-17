import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/agri/logo";

export default function CompleteProfilePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center">
          <Logo />
          <CardTitle className="font-headline pt-4">Just one last step</CardTitle>
          <CardDescription>Tell us a bit about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="e.g. Ramesh Kumar" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="location">Village / Tehsil</Label>
            <Input id="location" placeholder="e.g. Rampur, Hisar" />
          </div>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
            <Link href="/dashboard">Get Started</Link>
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
