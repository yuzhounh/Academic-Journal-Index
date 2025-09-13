"use client";

import { useState, useMemo, ChangeEvent, useCallback } from "react";
import { useJournals, type Journal } from "@/data/journals";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import JournalDetail from "./JournalDetail";

interface SearchPageProps {
  onJournalSelect: (journal: Journal) => void;
}

export default function SearchPage({ onJournalSelect }: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { journals, loading: journalsLoading } = useJournals();

  const filteredJournals = useMemo(() => {
    if (searchTerm.length < 3) {
      return [];
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return journals
      .filter((journal) =>
        journal.journalName.toLowerCase().includes(lowercasedTerm)
      )
      .sort((a, b) => {
        const factorA = typeof a.impactFactor === 'number' ? a.impactFactor : 0;
        const factorB = typeof b.impactFactor === 'number' ? b.impactFactor : 0;
        return factorB - factorA;
      });
  }, [searchTerm, journals]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  if (journalsLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[20vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Initializing search...</p>
        </div>
    )
  }

  return (
    <div>
        <div>
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            type="text"
            placeholder="Enter a journal name to search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 h-12 text-lg"
            aria-label="Search journals"
            />
        </div>
        </div>

        <div className="space-y-4">
        {searchTerm.length >= 3 && filteredJournals.length === 0 && (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No journals found for &quot;{searchTerm}&quot;.</p>
            </div>
        )}
        {filteredJournals.length > 0 && (
            <div className="grid gap-4">
                {filteredJournals.map((journal) => (
                    <Card
                    key={journal.issn}
                    className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200"
                    onClick={() => onJournalSelect(journal)}
                    >
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">{journal.journalName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{journal.issn}</p>
                    </CardContent>
                    </Card>
                ))}
            </div>
        )}
            {searchTerm.length > 0 && searchTerm.length < 3 && (
            <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">Continue typing...</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Enter at least 3 characters to begin searching.
                </p>
            </div>
        )}
        </div>
    </div>
  );
}
