"use client";

import { useState } from "react";
import { Mic, Search, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { voiceEquipmentSearch, VoiceEquipmentSearchOutput } from "@/ai/flows/voice-equipment-search";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function VoiceSearch({ onSearch }: { onSearch: (filters: VoiceEquipmentSearchOutput | null) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoiceEquipmentSearchOutput | null>(null);

  const handleSearch = async () => {
    if (!query) {
        onSearch(null); // Reset search
        setOpen(false);
        return;
    }
    setLoading(true);
    setResult(null);
    try {
      const searchResult = await voiceEquipmentSearch({ voiceQuery: query });
      setResult(searchResult);
      onSearch(searchResult);
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch (error) {
      console.error("AI search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-40"
            aria-label="Voice Search"
          >
            <Mic className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Voice Search</DialogTitle>
            <DialogDescription>
              What equipment are you looking for? e.g. "Rotavator chahiye"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="query" className="text-right">
                Search
              </Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="col-span-3"
                placeholder='e.g. "Tractor rent pe chahiye"'
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                }}
              />
            </div>
            {result && (
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Search Understood!</AlertTitle>
                <AlertDescription>
                  Looking for: {result.equipmentType} {result.rentalIntent ? '(for rent)' : ''}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setQuery('')} variant="ghost">Clear</Button>
            <Button onClick={handleSearch} disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading ? "Thinking..." : <><Search className="mr-2 h-4 w-4" /> Search</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
