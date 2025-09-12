"use client";

import { useState, useEffect } from "react";
import type { Journal } from "@/data/journals";
import { getSummary } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";

interface AiSummaryProps {
  journal: Journal;
}

export default function AiSummary({ journal }: AiSummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getSummary(journal);
        setSummary(result);
      } catch (e) {
        setError("Failed to generate summary.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [journal]);

  if (isLoading) {
    return (
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>
  }

  return (
    <p className="text-base text-foreground/90 leading-relaxed">
      {summary}
    </p>
  );
}
