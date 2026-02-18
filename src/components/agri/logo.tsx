import { Tractor } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
            <Tractor className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold font-headline text-primary">
                Agri Saadhan
            </h1>
        </div>
        <p className="text-xs font-medium text-muted-foreground/80">Farm Together, Grow Together</p>
    </div>
  );
}
