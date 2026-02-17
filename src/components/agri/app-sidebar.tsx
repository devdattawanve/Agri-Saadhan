import Link from "next/link";
import { Users, Home, Warehouse, User as UserIcon } from "lucide-react";
import { Logo } from "./logo";

// Define the user data type inline to avoid complex imports
interface AppUserData {
    roles?: string[];
    sahayakStatus?: 'NONE' | 'PENDING' | 'VERIFIED';
    [key: string]: any;
}

export function AppSidebar({ userData }: { userData?: AppUserData | null }) {
    const roles = userData?.roles || [];
    const sahayakStatus = userData?.sahayakStatus;

    return (
        <nav className="grid items-start px-4 text-sm font-medium">
            <div className="mb-4 pt-4">
                <Logo />
            </div>
            <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
                <Home className="h-4 w-4" />
                Farmer Dashboard
            </Link>

            {roles.includes('EQUIPMENT_OWNER') && (
                <Link
                    href="/owner-dashboard"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <Warehouse className="h-4 w-4" />
                    Owner Dashboard
                </Link>
            )}

            {roles.includes('DRIVER') && (
                <Link
                    href="/driver-dashboard"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <UserIcon className="h-4 w-4" />
                    Driver Dashboard
                </Link>
            )}

            {sahayakStatus === 'VERIFIED' && (
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
