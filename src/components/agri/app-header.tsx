"use client";

import { useState, useEffect } from "react";
import { CircleUser, Menu, LogOut, Users, Tractor, Warehouse, User as UserIcon, Home, Briefcase, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./app-sidebar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Home",
  "/equipment": "Equipment Marketplace",
  "/my-bookings": "My Bookings",
  "/my-equipment": "My Equipment",
  "/owner-bookings": "Bookings Received",
  "/sahayak": "Sahayak Dashboard",
  "/driver-dashboard": "Driver Dashboard",
  "/equipment/[id]": "Equipment Details",
  "/booking": "Book Equipment",
  "/profile": "Your Profile"
};

const HeaderSkeleton = () => (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <Tractor className="h-6 w-6 text-primary" />
                <span className="sr-only">Agri Saadhan</span>
            </Link>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial">
                <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
    </header>
);


export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  
  const beneficiaryId = searchParams.get('beneficiaryId');
  const isWorkMode = isMounted && !!beneficiaryId;

  const isFarmer = userData?.roles?.includes('FARMER');
  const isOwner = userData?.roles?.includes('EQUIPMENT_OWNER');
  const isDriver = userData?.roles?.includes('DRIVER');
  const isSahayakVerified = userData?.sahayakStatus === 'VERIFIED';
  
  const getTitle = () => {
    if (isWorkMode) return "Booking for Farmer";
    const matchingPath = Object.keys(pageTitles).find(path => {
        if (path.includes('[')) {
            const regex = new RegExp(`^${path.replace(/\[.*?\]/g, '[^/]+')}$`);
            return regex.test(pathname);
        }
        return pathname.startsWith(path);
    });
    return matchingPath ? pageTitles[matchingPath] : "Agri Saadhan";
  }
  
  const title = getTitle();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  }

  const navLinkClass = (path: string) => {
    const isActive = pathname.startsWith(path);
    return cn(
        "transition-colors",
        { "text-white font-bold": isActive && isWorkMode },
        { "text-amber-200 hover:text-white": !isActive && isWorkMode },
        { "text-foreground font-bold": isActive && !isWorkMode },
        { "text-muted-foreground hover:text-foreground": !isActive && !isWorkMode }
    );
  }

  const isLoading = isUserLoading || isUserDataLoading;

  if (!isMounted) {
    return <HeaderSkeleton />;
  }

  return (
    <header className={cn(
        "flex h-16 items-center gap-4 border-b px-4 md:px-6 sticky top-0 z-30",
        isWorkMode ? "bg-amber-600" : "bg-card"
    )}>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/dashboard" className={cn("flex items-center gap-2 text-lg font-semibold md:text-base", isWorkMode && "text-white")}>
          <Tractor className={cn("h-6 w-6", isWorkMode ? "text-white" : "text-primary")} />
          <span className="sr-only">Agri Saadhan</span>
        </Link>
        
        <Link href="/dashboard" className={navLinkClass('/dashboard')}>
          Home
        </Link>
        <Link href="/equipment" className={navLinkClass('/equipment')}>
          Equipment
        </Link>
        
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </>
        ) : (
          <>
            {isFarmer && (
                <Link href="/my-bookings" className={navLinkClass('/my-bookings')}>
                    My Bookings
                </Link>
            )}

            {isOwner && (
                <>
                    <Link href="/my-equipment" className={navLinkClass('/my-equipment')}>
                        My Equipment
                    </Link>
                    <Link href="/owner-bookings" className={navLinkClass('/owner-bookings')}>
                        Bookings
                    </Link>
                </>
            )}

            {isDriver && (
                <Link href="/driver-dashboard" className={navLinkClass('/driver-dashboard')}>
                    Driver
                </Link>
            )}

            {isSahayakVerified && (
                <Link href="/sahayak" className={navLinkClass('/sahayak')}>
                    Sahayak
                </Link>
            )}
          </>
        )}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className={cn("shrink-0 md:hidden", isWorkMode && "border-amber-400 text-white hover:bg-amber-500")}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <AppSidebar userData={userData} />
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <h1 className={cn("text-xl font-bold font-headline", isWorkMode && "text-white")}>{title}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData?.profilePictureUrl || undefined} alt={userData?.name} />
                <AvatarFallback>
                  {isLoading ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  ) : (
                    userData?.name ? userData.name[0].toUpperCase() : <CircleUser className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : userData?.name ? (
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userData.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.phoneNumber}
                  </p>
                </div>
              ) : "My Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
