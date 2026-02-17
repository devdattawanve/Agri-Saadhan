import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/agri/logo";

export default function VerifyOtpPage() {
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
            <Input id="otp" type="text" placeholder="_ _ _ _ _ _" className="text-center tracking-[0.5em]" />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            SMS with OTP is automatically read.
          </p>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
            <Link href="/complete-profile">Verify</Link>
          </Button>
          <Button variant="link" className="w-full">Call Me for OTP</Button>
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
