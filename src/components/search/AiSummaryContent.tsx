"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface AiSummaryContentProps {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function AiSummaryContent({ summary, isLoading, error }: AiSummaryContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!summary) {
    return <p>No summary available.</p>
  }

  return (
    <div className="text-base text-foreground/90 leading-relaxed whitespace-pre-line">
      {summary}
    </div>
  );
}
