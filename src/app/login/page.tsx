import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/agri/logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center">
          <Logo />
          <CardTitle className="font-headline pt-4">Welcome Back!</CardTitle>
          <CardDescription>Enter your mobile number to login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="flex items-center gap-2">
              <span className="rounded-md border bg-muted px-3 py-2 text-sm">+91</span>
              <Input id="phone" type="tel" placeholder="98765 43210" />
            </div>
          </div>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
            <Link href="/verify-otp">Send OTP</Link>
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
