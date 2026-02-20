"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

interface RatingFormProps {
    onSubmit: (rating: number, description: string) => void;
    isSubmitting: boolean;
}

export function RatingForm({ onSubmit, isSubmitting }: RatingFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating, description);
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t mt-4">
            <Label className="font-semibold">Rate this service</Label>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            "h-8 w-8 cursor-pointer transition-colors",
                            (hoverRating >= star || rating >= star)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                        )}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    />
                ))}
            </div>
            <Textarea
                placeholder="Share your experience with the equipment and owner..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Rating"}
            </Button>
        </div>
    );
}
