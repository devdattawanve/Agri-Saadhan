import { Leaf } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Leaf className="h-8 w-8 text-accent" />
      <h1 className="text-2xl font-bold font-headline text-primary">
        Agri Saadhan
      </h1>
    </div>
  );
}
