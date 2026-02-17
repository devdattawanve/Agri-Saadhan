import Link from "next/link";
import { Tractor, Users, Home } from "lucide-react";
import { Logo } from "./logo";

export function AppSidebar() {

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
        Home
      </Link>
      <Link
        href="/sahayak"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Users className="h-4 w-4" />
        Sahayak Mode
      </Link>
    </nav>
  );
}
