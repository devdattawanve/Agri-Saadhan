import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OwnerDashboardPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Equipment</CardTitle>
                <CardDescription>Manage your equipment listings and view bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Your equipment will be listed here.</p>
                <Button className="mt-4">Add New Equipment</Button>
            </CardContent>
        </Card>
    );
}
