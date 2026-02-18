"use client";

import { AppHeader } from "@/components/agri/app-header";
import { AppSidebar } from "@/components/agri/app-sidebar";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userData } = useDoc(userDocRef);

  return (
    <SidebarProvider>
        <Sidebar>
            <AppSidebar userData={userData} />
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-1 p-4 md:p-8 bg-muted/40">
                    {children}
                </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
