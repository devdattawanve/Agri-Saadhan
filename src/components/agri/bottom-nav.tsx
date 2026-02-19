"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tractor, CalendarCheck, Wrench, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the user data type inline to avoid complex imports
interface AppUserData {
    roles?: string[];
    [key: string]: any;
}

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);

    return (
        <Link href={href} className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
            isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
        )}>
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium tracking-tight">{label}</span>
        </Link>
    );
}

export function BottomNav({ userData }: { userData?: AppUserData | null }) {
    const roles = userData?.roles || [];
    const isFarmer = roles.includes('FARMER');
    const isOwner = roles.includes('EQUIPMENT_OWNER');

    const navItems = [
        { href: "/dashboard", icon: Home, label: "Home", show: true },
        { href: "/equipment", icon: Tractor, label: "Equipment", show: true },
        { href: "/my-bookings", icon: CalendarCheck, label: "My Bookings", show: isFarmer },
        { href: "/my-equipment", icon: Wrench, label: "My Equipment", show: isOwner },
        { href: "/owner-bookings", icon: ClipboardList, label: "Bookings", show: isOwner },
    ].filter(item => item.show);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <nav className="flex items-stretch justify-around h-full">
                {navItems.map(item => (
                    <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
                ))}
            </nav>
        </div>
    );
}
