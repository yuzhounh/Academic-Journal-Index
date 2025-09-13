"use client";

import { useState, useEffect } from "react";
import type { Journal } from "@/data/journals";
import { getSummary } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy } from "lucide-react";

interface AiSummaryProps {
  journal: Journal;
  onJournalSelect: (journalName: string) => void;
}

type RelatedJournal = {
  journalName: string;
  issn: string;
};

export default function AiSummary({ journal, onJournalSelect }: AiSummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [relatedJournals, setRelatedJournals] = useState<RelatedJournal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getSummary(journal);
        setSummary(result.summary);
        setRelatedJournals(result.relatedJournals || []);
      } catch (e) {
        setError("Failed to generate summary.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (journal) {
      fetchSummary();
    }
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
    <div className="space-y-6">
      <p className="text-base text-foreground/90 leading-relaxed">
        {summary}
      </p>

      {relatedJournals.length > 0 && (
          <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookCopy className="text-primary"/>
                Related Journals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedJournals.map((relatedJournal, index) => (
                      <Card 
                        key={index} 
                        className="cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                        onClick={() => onJournalSelect(relatedJournal.journalName)}
                      >
                          <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-base font-medium leading-tight line-clamp-2">{relatedJournal.journalName}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-1">
                            <p className="text-sm text-muted-foreground">{relatedJournal.issn}</p>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
