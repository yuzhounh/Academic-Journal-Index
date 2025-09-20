"use client";

import { useState, useMemo, ChangeEvent, useEffect } from "react";
import { useJournals, type Journal } from "@/data/journals";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Crown, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryStats from "./CategoryStats";

interface SearchPageProps {
  onJournalSelect: (journal: Journal, searchTerm: string) => void;
  initialSearchTerm?: string;
}

const partitionMap: { [key: string]: string } = {
  "1": "一区",
  "2": "二区",
  "3": "三区",
  "4": "四区",
};

const getPartitionColorClass = (partition: string): string => {
    const mainPartition = partition.charAt(0);
    switch (mainPartition) {
        case '1': return "text-red-500";
        case '2': return "text-orange-500";
        case '3': return "text-yellow-600";
        case '4': return "text-green-600";
        default: return "text-muted-foreground";
    }
};

const AuthorityBadge = ({ level }: { level: string }) => {
    let icon;
    let variant: "authority1" | "authority2" | "authority3" | "secondary" = "secondary";
    switch (level) {
        case "一级":
            icon = <Crown className="h-3 w-3" />;
            variant = "authority1";
            break;
        case "二级":
            icon = <Medal className="h-3 w-3" />;
            variant = "authority2";
            break;
        case "三级":
            icon = <Star className="h-3 w-3" />;
            variant = "authority3";
            break;
        default:
            return null;
    }
    return (
        <Badge variant={variant} className="gap-1 pl-1 pr-1.5">
            {icon}
            <span className="text-xs">{level}</span>
        </Badge>
    )
}

export default function SearchPage({ onJournalSelect, initialSearchTerm = "" }: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const { journals, loading: journalsLoading } = useJournals();

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

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
      }).slice(0, 50); // Limit results for performance
  }, [searchTerm, journals]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  if (journalsLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Initializing search...</p>
        </div>
    )
  }

  const showInitialMessage = searchTerm.length < 3 && filteredJournals.length === 0;
  const showNoResultsMessage = searchTerm.length >= 3 && filteredJournals.length === 0;

  return (
    <div className="w-full">
      <div className="relative mb-6">
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

      {filteredJournals.length > 0 && (
        <div className="mb-6 animate-in fade-in-50 duration-300">
          <CategoryStats journals={filteredJournals} />
        </div>
      )}

      {showInitialMessage && (
          <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
              <Search className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Start your search</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                  Enter at least 3 characters to begin searching for journals.
              </p>
          </div>
      )}
      {showNoResultsMessage && (
          <div className="text-center py-10">
              <p className="text-muted-foreground">No journals found for &quot;{searchTerm}&quot;.</p>
          </div>
      )}

      {filteredJournals.length > 0 && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          {filteredJournals.map((journal) => (
            <Card
              key={journal.issn}
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-shadow"
              onClick={() => onJournalSelect(journal, searchTerm)}
            >
              <CardContent className="p-6 grid grid-cols-12 items-start gap-4">
                <div className="col-span-7">
                    <p className="font-headline text-lg font-semibold truncate">{journal.journalName}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">{journal.issn}</p>
                        <AuthorityBadge level={journal.authorityJournal} />
                    </div>
                </div>
                <div className="col-span-2 text-center">
                    <p className="text-xs text-muted-foreground font-semibold">Impact Factor</p>
                    <p className="font-medium text-lg">{Number(journal.impactFactor).toFixed(1)}</p>
                </div>
                <div className="col-span-3 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">CAS Partition</p>
                  <div className={cn("flex items-center font-semibold text-lg", getPartitionColorClass(journal.majorCategoryPartition))}>
                      <span className="ml-1">
                        {partitionMap[journal.majorCategoryPartition.charAt(0)] || journal.majorCategoryPartition}
                      </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
