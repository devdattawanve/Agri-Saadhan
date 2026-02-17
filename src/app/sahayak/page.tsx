import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SahayakPage() {
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Book for a Farmer</CardTitle>
                        <CardDescription>Select a farmer from your list or add a new one.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="farmer-phone">Farmer's Mobile Number</Label>
                            <Input id="farmer-phone" placeholder="Enter 10-digit mobile number" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="farmer-name">Farmer's Name</Label>
                            <Input id="farmer-name" placeholder="Enter farmer's full name" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="bg-accent hover:bg-accent/90">Find Equipment</Button>
                    </CardFooter>
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
