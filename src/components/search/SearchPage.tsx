"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { journals, type Journal } from "@/data/journals";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import JournalDetail from "./JournalDetail";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

  const filteredJournals = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return journals.filter((journal) =>
      journal.journalName.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (selectedJournal) {
      setSelectedJournal(null);
    }
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
  };
  
  const handleClearSelection = () => {
    setSelectedJournal(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          Scholar Search
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Instantly find detailed information and AI-powered insights for academic journals.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
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

        {selectedJournal ? (
          <JournalDetail journal={selectedJournal} onBack={handleClearSelection} />
        ) : (
          <div className="space-y-4">
            {searchTerm && filteredJournals.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No journals found for &quot;{searchTerm}&quot;.</p>
                </div>
            )}
            {searchTerm && filteredJournals.length > 0 && (
                <div className="grid gap-4">
                    {filteredJournals.map((journal) => (
                        <Card
                        key={journal.issn}
                        className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200"
                        onClick={() => handleJournalSelect(journal)}
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
             {!searchTerm && (
                <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">Start your search</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Type in the search bar above to find journals.
                    </p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
