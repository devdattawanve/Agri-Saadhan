"use client";

import { CircleUser, Menu, LogOut, Users, Tractor, Warehouse, User as UserIcon } from "lucide-react";
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

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Farmer Dashboard",
  "/sahayak": "Sahayak Dashboard",
  "/owner-dashboard": "Owner Dashboard",
  "/driver-dashboard": "Driver Dashboard",
  "/equipment": "Equipment Details",
  "/booking": "Book Equipment",
  "/profile": "Your Profile"
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc(userDocRef);
  
  const beneficiaryId = searchParams.get('beneficiaryId');
  const isWorkMode = !!beneficiaryId;

  const isSahayakVerified = userData?.sahayakStatus === 'VERIFIED';
  
  const title = isWorkMode 
    ? "Booking for Farmer" 
    : Object.keys(pageTitles).find(path => pathname.startsWith(path) && path !== '/') 
      ? pageTitles[Object.keys(pageTitles).find(path => pathname.startsWith(path) && path !== '/')!] 
      : "Agri Saadhan";


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
        
        <Link href={isWorkMode ? `/dashboard?beneficiaryId=${beneficiaryId}` : "/dashboard"} className={navLinkClass('/dashboard')}>
          Farmer
        </Link>
        
        {userData?.roles?.includes('EQUIPMENT_OWNER') && (
            <Link href="/owner-dashboard" className={navLinkClass('/owner-dashboard')}>
                Owner
            </Link>
        )}

        {userData?.roles?.includes('DRIVER') && (
            <Link href="/driver-dashboard" className={navLinkClass('/driver-dashboard')}>
                Driver
            </Link>
        )}

        {isSahayakVerified && (
            <Link href="/sahayak" className={navLinkClass('/sahayak')}>
                Sahayak
            </Link>
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
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {userData?.name ? (
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
