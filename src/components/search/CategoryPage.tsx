
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Journal } from "@/data/journals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowLeft, BookText, Crown, Medal, Star } from "lucide-react";
import JournalDetail from "./JournalDetail";
import SearchPage from "./SearchPage";
import CategoryStats from "./CategoryStats";
import { cn } from "@/lib/utils";

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
    case "1":
      return "text-red-500";
    case "2":
      return "text-orange-500";
    case "3":
      return "text-yellow-600";
    case "4":
      return "text-green-600";
    default:
      return "text-muted-foreground";
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

const extractRank = (partition: string): number => {
  const match = partition.match(/\[(\d+)\//);
  return match ? parseInt(match[1], 10) : Infinity;
};

interface CategoryPageProps {
  journals: Journal[];
}

export default function CategoryPage({ journals }: CategoryPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<"categories" | "search">("search");
  
  // State to preserve search query when navigating to detail view
  const [preservedSearchTerm, setPreservedSearchTerm] = useState("");


  const categories = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    journals.forEach((journal) => {
      if (journal.majorCategory) {
        categoryCounts[journal.majorCategory] =
          (categoryCounts[journal.majorCategory] || 0) + 1;
      }
    });
    return categoryCounts;
  }, [journals]);

  const sortedCategories = useMemo(() => {
    return Object.entries(categories).sort(
      ([, countA], [, countB]) => countB - countA
    );
  }, [categories]);

  const journalsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return journals
      .filter((j) => j.majorCategory === selectedCategory)
      .sort((a, b) => {
        const rankA = extractRank(a.majorCategoryPartition);
        const rankB = extractRank(b.majorCategoryPartition);
        return rankA - rankB;
      });
  }, [journals, selectedCategory]);

  const paginatedJournals = useMemo(() => {
    const startIndex = (currentPage - 1) * JOURNALS_PER_PAGE;
    return journalsForCategory.slice(
      startIndex,
      startIndex + JOURNALS_PER_PAGE
    );
  }, [journalsForCategory, currentPage]);

  const totalPages = Math.ceil(journalsForCategory.length / JOURNALS_PER_PAGE);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSelectedJournal(null);
  };

  const handleJournalSelect = (journal: Journal, searchTerm: string = "") => {
    if (view === 'search') {
      setPreservedSearchTerm(searchTerm);
    }
    setSelectedJournal(journal);
  };

  const handleJournalSelectByName = useCallback(
    (journalName: string) => {
      const journal = journals.find((j) => j.journalName === journalName);
      if (journal) {
        setSelectedJournal(journal);
        window.scrollTo(0, 0);
      }
    },
    [journals]
  );

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedJournal(null);
  };

  const handleBackFromDetail = () => {
    setSelectedJournal(null);
    // No need to reset view, it should persist.
    // The search term is preserved in `preservedSearchTerm`
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };
  
  const handleViewChange = (newView: 'search' | 'categories') => {
    setView(newView);
    setSelectedCategory(null);
    setSelectedJournal(null);
    setPreservedSearchTerm("");
  }

  if (selectedJournal) {
    return (
      <div className="py-4 md:py-8">
        <JournalDetail
          journal={selectedJournal}
          onBack={handleBackFromDetail}
          onJournalSelect={handleJournalSelectByName}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case "search":
        return <SearchPage journals={journals} onJournalSelect={handleJournalSelect} initialSearchTerm={preservedSearchTerm} />;
      case "categories":
        if (selectedCategory) {
          return (
            <div className="animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBackToCategories}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">
                  {selectedCategory}
                </h2>
              </div>
              <div className="mb-8">
                <CategoryStats journals={journalsForCategory} />
              </div>
              <div className="space-y-4">
                {paginatedJournals.map((journal) => (
                   <Card
                    key={journal.issn}
                    className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-shadow"
                    onClick={() => handleJournalSelect(journal)}
                  >
                    <CardContent className="p-6 grid grid-cols-12 items-start gap-4">
                      <div className="col-span-7">
                        <p className="font-headline text-lg font-semibold truncate">
                          {journal.journalName}
                        </p>
                         <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                            {journal.issn}
                            </p>
                            <AuthorityBadge level={journal.authorityJournal} />
                            {journal.openAccess === "是" && <Badge variant="openAccess">OA</Badge>}
                         </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <p className="text-xs text-muted-foreground font-semibold">
                          Impact Factor
                        </p>
                        <p className="font-medium text-lg">
                          {Number(journal.impactFactor).toFixed(1)}
                        </p>
                      </div>
                      <div className="col-span-3 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">
                          CAS Partition
                        </p>
                        <div
                          className={cn(
                            "flex items-center font-semibold text-lg",
                            getPartitionColorClass(
                              journal.majorCategoryPartition
                            )
                          )}
                        >
                          <span className={cn("ml-1")}>
                            {partitionMap[
                              journal.majorCategoryPartition.charAt(0)
                            ] || journal.majorCategoryPartition}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
        } else {
          return (
            <div className="animate-in fade-in-50 duration-300 space-y-8">
              <CategoryStats journals={journals} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sortedCategories.map(([category, count]) => (
                  <Card
                    key={category}
                    className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 flex flex-col"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <CardHeader className="flex-grow pb-2">
                      <CardTitle className="font-headline text-xl">
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookText className="w-4 h-4 mr-2" />
                        <span>{count} journals</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <>
      <div className="py-4 md:py-8">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
            Academic Journal Index
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Search journals by title or browse journals by category.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => handleViewChange("search")}
              variant={view === "search" ? "default" : "outline"}
            >
              Search Journals
            </Button>
            <Button
              onClick={() => handleViewChange("categories")}
              variant={view === "categories" ? "default" : "outline"}
            >
              Browse Categories
            </Button>
          </div>
        </div>
        {renderContent()}
      </div>
      <footer className="text-center text-sm text-muted-foreground py-4 border-t">
        © 2025 Jing Wang. All Rights Reserved.
        <br />
        Last Updated: September 2025
      </footer>
    </>
  );
}
