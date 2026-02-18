import { AuthenticatedLayout } from "@/components/agri/authenticated-layout";

export default function EquipmentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
        {children}
    </AuthenticatedLayout>
  );
}
