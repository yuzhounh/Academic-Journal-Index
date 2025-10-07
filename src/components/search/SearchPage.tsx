

"use client";

import { useState, useMemo, ChangeEvent, useEffect } from "react";
import type { Journal } from "@/data/journals";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Loader2, Crown, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryStats from "./CategoryStats";

interface SearchPageProps {
  journals: Journal[];
  onJournalSelect: (journal: Journal, searchTerm: string) => void;
  initialSearchTerm?: string;
}

const JOURNALS_PER_PAGE = 20;

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
            <span className="text-xs whitespace-nowrap">{level}</span>
        </Badge>
    )
}

// Helper function to generate pagination items
const getPaginationItems = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) => {
  const pages = [];
  const pageLimit = 5; // how many numbers to show around current page, start, and end

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const renderPage = (pageNumber: number) => (
    <PaginationItem key={pageNumber}>
      <PaginationLink
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onPageChange(pageNumber);
        }}
        isActive={currentPage === pageNumber}
      >
        {pageNumber}
      </PaginationLink>
    </PaginationItem>
  );

  const renderEllipsis = (key: string) => (
    <PaginationItem key={key}>
      <PaginationEllipsis />
    </PaginationItem>
  );

  if (totalPages <= pageLimit * 2 + 1) {
    // Show all pages if total is small enough
    return range(1, totalPages).map((p) => renderPage(p));
  }

  // Start pages
  pages.push(...range(1, pageLimit).map((p) => renderPage(p)));

  // Ellipsis after start
  if (currentPage > pageLimit + 2) {
    pages.push(renderEllipsis("start-ellipsis"));
  }

  // Middle pages
  const middleStart = Math.max(pageLimit + 1, currentPage - 2);
  const middleEnd = Math.min(totalPages - pageLimit, currentPage + 2);

  if (middleStart > pageLimit + 1 && middleStart <= totalPages - pageLimit) {
    pages.push(...range(middleStart, middleEnd).map((p) => renderPage(p)));
  } else if (currentPage > pageLimit && currentPage <= totalPages - pageLimit) {
    pages.push(...range(currentPage - 2, currentPage + 2).map((p) => renderPage(p)));
  }

  // Ellipsis before end
  if (currentPage < totalPages - pageLimit - 1) {
    pages.push(renderEllipsis("end-ellipsis"));
  }

  // End pages
  pages.push(...range(totalPages - pageLimit + 1, totalPages).map((p) => renderPage(p)));

  // De-duplicate pages
  const uniquePages = pages.filter(
    (item, index, self) => index === self.findIndex((t) => t.key === item.key)
  );

  return uniquePages;
};

const formatImpactFactor = (factor: number | string) => {
    const num = Number(factor);
    if (!isNaN(num) && String(factor).trim() !== "" && !String(factor).includes('<')) {
      return num.toFixed(1);
    }
    return factor;
};

function SearchClient({ journals, onJournalSelect, initialSearchTerm = "" }: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setCurrentPage(1);
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
      });
  }, [searchTerm, journals]);

  const totalPages = Math.ceil(filteredJournals.length / JOURNALS_PER_PAGE);

  const paginatedJournals = useMemo(() => {
    const startIndex = (currentPage - 1) * JOURNALS_PER_PAGE;
    return filteredJournals.slice(startIndex, startIndex + JOURNALS_PER_PAGE);
  }, [filteredJournals, currentPage]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const showInitialMessage = searchTerm.length < 3;
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
          className="w-full pl-10 h-12 text-lg shadow-md focus-visible:shadow-lg transition-shadow"
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

      {paginatedJournals.length > 0 && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          {paginatedJournals.map((journal) => (
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
                        {journal.openAccess === "是" && <Badge variant="openAccess">OA</Badge>}
                    </div>
                </div>
                <div className="col-span-2 text-center">
                    <p className="text-xs text-muted-foreground font-semibold">Impact Factor</p>
                    <p className="font-medium text-lg">{formatImpactFactor(journal.impactFactor)}</p>
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

      {totalPages > 1 && (
        <Pagination className="mt-8">
            <PaginationContent>
            <PaginationItem>
                <PaginationPrevious
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                }}
                aria-disabled={currentPage === 1}
                className={
                    currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
                />
            </PaginationItem>

            {getPaginationItems(currentPage, totalPages, handlePageChange)}

            <PaginationItem>
                <PaginationNext
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                }}
                aria-disabled={currentPage === totalPages}
                className={
                    currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
                />
            </PaginationItem>
            </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default function SearchPage({ journals, onJournalSelect, initialSearchTerm = "" }: SearchPageProps) {
  return <SearchClient journals={journals} onJournalSelect={onJournalSelect} initialSearchTerm={initialSearchTerm} />;
}
