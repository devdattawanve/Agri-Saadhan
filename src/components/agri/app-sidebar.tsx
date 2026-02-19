import Link from "next/link";
import { Users, Home, Wrench, User as UserIcon, Tractor, CalendarCheck } from "lucide-react";

// Define the user data type inline to avoid complex imports
interface AppUserData {
    roles?: string[];
    sahayakStatus?: 'NONE' | 'PENDING' | 'VERIFIED';
    [key: string]: any;
}

export function AppSidebar({ userData }: { userData?: AppUserData | null }) {
    const roles = userData?.roles || [];
    const isFarmer = roles.includes('FARMER');
    const isOwner = roles.includes('EQUIPMENT_OWNER');
    const isDriver = roles.includes('DRIVER');
    const isSahayakVerified = userData?.sahayakStatus === 'VERIFIED';

    return (
        <nav className="grid items-start text-sm font-medium">
            <div className="mb-4">
                <img
                  src="https://image2url.com/r2/default/images/1771448027626-30acbb98-1ed9-40fa-a44e-8edfcbad9400.jpeg"
                  alt="Agri Saadhan Logo"
                  width={400}
                  height={194}
                  style={{
                    color: 'transparent',
                    height: 'auto',
                    maxWidth: '100%',
                  }}
                />
            </div>
            <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
                <Home className="h-4 w-4" />
                Home
            </Link>
            <Link
                href="/equipment"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
                <Tractor className="h-4 w-4" />
                Equipment
            </Link>

            {isFarmer && (
                <Link
                    href="/my-bookings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <CalendarCheck className="h-4 w-4" />
                    My Bookings
                </Link>
            )}

            {isOwner && (
                <>
                    <Link
                        href="/my-equipment"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Wrench className="h-4 w-4" />
                        My Equipment
                    </Link>
                    <Link
                        href="/owner-bookings"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <CalendarCheck className="h-4 w-4" />
                        Bookings
                    </Link>
                </>
            )}

            {isDriver && (
                <Link
                    href="/driver-dashboard"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <UserIcon className="h-4 w-4" />
                    Driver Dashboard
                </Link>
            )}

            {isSahayakVerified && (
                <Link
                    href="/sahayak"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <Users className="h-4 w-4" />
                    Sahayak Dashboard
                </Link>
            )}
        </nav>
    );
}
