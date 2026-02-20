"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Home, Wrench, User as UserIcon, Tractor, CalendarCheck, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";


// Define the user data type inline to avoid complex imports
interface AppUserData {
    roles?: string[];
    sahayakStatus?: 'NONE' | 'PENDING' | 'VERIFIED';
    [key: string]: any;
}

const NavLink = ({ href, icon: Icon, label, exact = false }: { href: string; icon: React.ElementType; label: string; exact?: boolean}) => {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
            )}
        >
            <Icon className="h-5 w-5" />
            {label}
        </Link>
    );
};

export function AppSidebar({ userData }: { userData?: AppUserData | null }) {
    const roles = userData?.roles || [];
    const isFarmer = roles.includes('FARMER');
    const isOwner = roles.includes('EQUIPMENT_OWNER');
    const isDriver = roles.includes('DRIVER');
    const isSahayakVerified = userData?.sahayakStatus === 'VERIFIED';

    return (
        <nav className="grid items-start p-2 text-sm font-medium">
            <div className="mb-4 px-1">
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
            <NavLink href="/dashboard" icon={Home} label="Home" exact={true} />
            <NavLink href="/equipment" icon={Tractor} label="Equipment" />

            {isFarmer && (
                <NavLink href="/my-bookings" icon={CalendarCheck} label="My Bookings" />
            )}

            {isOwner && (
                <>
                    <NavLink href="/my-equipment" icon={Wrench} label="My Equipment" />
                    <NavLink href="/owner-bookings" icon={ClipboardList} label="Bookings" />
                </>
            )}

            {isDriver && (
                <NavLink href="/driver-dashboard" icon={UserIcon} label="Driver Dashboard" />
            )}

            {isSahayakVerified && (
                <NavLink href="/sahayak" icon={Users} label="Sahayak Dashboard" />
            )}
        </nav>
    );
}
