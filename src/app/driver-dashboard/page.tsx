import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DriverDashboardPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Driving Tasks</CardTitle>
                <CardDescription>View your assigned driving jobs and update their status.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Your driving tasks will appear here.</p>
            </CardContent>
        </Card>
    );
}
