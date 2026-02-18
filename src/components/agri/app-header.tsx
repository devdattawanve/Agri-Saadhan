"use client";

import { useState, useEffect } from "react";
import { CircleUser, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/equipment": "Equipment Marketplace",
  "/my-bookings": "My Bookings",
  "/my-equipment": "My Equipment",
  "/owner-dashboard": "Owner Dashboard",
  "/owner-bookings": "Bookings Received",
  "/sahayak": "Sahayak Dashboard",
  "/driver-dashboard": "Driver Dashboard",
  "/equipment/[id]": "Equipment Details",
  "/booking/[id]": "Book Equipment",
  "/profile": "Your Profile",
  "/my-equipment/add": "Add Equipment",
};

const HeaderSkeleton = () => (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 md:hidden" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-4">
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
  
  const getTitle = () => {
    if (isWorkMode) return "Booking for Farmer";
    const matchingPath = Object.keys(pageTitles).find(path => {
        const regexPath = `^${path.replace(/\[.*?\]/g, '[^/]+')}$`;
        return new RegExp(regexPath).test(pathname);
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

  const isLoading = isUserLoading || isUserDataLoading;

  if (!isMounted) {
    return <HeaderSkeleton />;
  }

  return (
    <header className={cn(
        "flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30",
        isWorkMode && "bg-amber-600"
    )}>
      <div className="flex items-center gap-2">
        <SidebarTrigger className={cn("md:hidden", isWorkMode && "border-amber-400 text-white hover:bg-amber-500")} />
        <h1 className={cn("text-lg font-semibold md:text-xl", isWorkMode && "text-white")}>{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
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
