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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AppSidebar } from "./app-sidebar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useMemo } from "react";

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Farmer Dashboard",
  "/sahayak": "Sahayak Dashboard",
  "/owner-dashboard": "Owner Dashboard",
  "/driver-dashboard": "Driver Dashboard",
  "/equipment": "Equipment Details",
  "/booking": "Book Equipment"
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc(userDocRef);

  const isSahayakVerified = userData?.sahayakStatus === 'VERIFIED';
  
  const title = Object.keys(pageTitles).find(path => pathname.startsWith(path) && path !== '/') 
    ? pageTitles[Object.keys(pageTitles).find(path => pathname.startsWith(path) && path !== '/')!] 
    : "Agri Saadhan";


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Tractor className="h-6 w-6 text-primary" />
          <span className="sr-only">Agri Saadhan</span>
        </Link>

        <Link href="/dashboard" className={`transition-colors hover:text-foreground ${pathname.startsWith('/dashboard') ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
          Farmer
        </Link>
        
        {userData?.roles?.includes('EQUIPMENT_OWNER') && (
            <Link href="/owner-dashboard" className={`transition-colors hover:text-foreground ${pathname.startsWith('/owner-dashboard') ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                Owner
            </Link>
        )}

        {userData?.roles?.includes('DRIVER') && (
            <Link href="/driver-dashboard" className={`transition-colors hover:text-foreground ${pathname.startsWith('/driver-dashboard') ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                Driver
            </Link>
        )}

        {isSahayakVerified && (
            <Link href="/sahayak" className={`transition-colors hover:text-foreground ${pathname.startsWith('/sahayak') ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                Sahayak
            </Link>
        )}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
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
          <h1 className="text-xl font-bold font-headline">{title}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
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
