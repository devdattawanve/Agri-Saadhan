import Link from "next/link";
import { Users, Home, Warehouse, User as UserIcon, Tractor, Book, Briefcase } from "lucide-react";
import { Logo } from "./logo";

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
                <Logo />
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
                    <Book className="h-4 w-4" />
                    My Bookings
                </Link>
            )}

            {isOwner && (
                <>
                    <Link
                        href="/my-equipment"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Warehouse className="h-4 w-4" />
                        My Equipment
                    </Link>
                    <Link
                        href="/owner-bookings"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Briefcase className="h-4 w-4" />
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
