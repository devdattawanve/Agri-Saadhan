import { AppHeader } from "@/components/agri/app-header";

export default function EquipmentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
}
