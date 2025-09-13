

"use client";

import { useState, useMemo, useCallback } from "react";
import { useJournals, type Journal } from "@/data/journals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookText, Loader2, Crown } from "lucide-react";
import JournalDetail from "./JournalDetail";
import SearchPage from "./SearchPage";

const JOURNALS_PER_PAGE = 20;

const partitionMap: { [key: string]: string } = {
  "1": "一区",
  "2": "二区",
  "3": "三区",
  "4": "四区",
};

const getPartitionBadgeVariant = (partition: string): "level1" | "level2" | "level3" | "level4" | "secondary" => {
    const mainPartition = partition.charAt(0);
    switch (mainPartition) {
        case '1': return "level1";
        case '2': return "level2";
        case '3': return "level3";
        case '4': return "level4";
        default: return "secondary";
    }
};

// Helper function to generate pagination items
const getPaginationItems = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
    const pages = [];
    const pageLimit = 5; // how many numbers to show around current page, start, and end
    
    const range = (start: number, end: number) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, i) => start + i);
    };

    const renderPage = (pageNumber: number) => (
        <PaginationItem key={pageNumber}>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(pageNumber); }} isActive={currentPage === pageNumber}>
                {pageNumber}
            </PaginationLink>
        </PaginationItem>
    );

    const renderEllipsis = (key: string) => <PaginationItem key={key}><PaginationEllipsis /></PaginationItem>;

    if (totalPages <= pageLimit * 2 + 3) { // Show all pages if total is small enough
        return range(1, totalPages).map(p => renderPage(p));
    }

    const startPages = range(1, pageLimit);
    const endPages = range(totalPages - pageLimit + 1, totalPages);
    
    let middlePages = [];
    const middleStart = Math.max(pageLimit + 1, currentPage - 2);
    const middleEnd = Math.min(totalPages - pageLimit, currentPage + 2);

    pages.push(...startPages.map(p => renderPage(p)));
    
    if (middleStart > pageLimit + 1) {
        pages.push(renderEllipsis("start-ellipsis"));
    }

    middlePages = range(middleStart, middleEnd);
    pages.push(...middlePages.map(p => renderPage(p)));

    if (middleEnd < totalPages - pageLimit) {
        pages.push(renderEllipsis("end-ellipsis"));
    }

    pages.push(...endPages.map(p => renderPage(p)));
    
    // De-duplicate pages
    const uniquePages = pages.filter((item, index, self) => 
        index === self.findIndex((t) => t.key === item.key)
    );

    return uniquePages;
};

const extractRank = (partition: string): number => {
  const match = partition.match(/\[(\d+)\//);
  return match ? parseInt(match[1], 10) : Infinity;
};

export default function CategoryPage() {
  const { journals, loading } = useJournals();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<'categories' | 'search'>('search');

  const categories = useMemo(() => {
    if (loading) return {};
    const categoryCounts: { [key: string]: number } = {};
    journals.forEach((journal) => {
      if (journal.majorCategory) {
        categoryCounts[journal.majorCategory] = (categoryCounts[journal.majorCategory] || 0) + 1;
      }
    });
    return categoryCounts;
  }, [journals, loading]);

  const sortedCategories = useMemo(() => {
    return Object.entries(categories).sort(([, countA], [, countB]) => countB - countA);
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
    return journalsForCategory.slice(startIndex, startIndex + JOURNALS_PER_PAGE);
  }, [journalsForCategory, currentPage]);

  const totalPages = Math.ceil(journalsForCategory.length / JOURNALS_PER_PAGE);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSelectedJournal(null);
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
  };
  
  const handleJournalSelectByName = useCallback((journalName: string) => {
    const journal = journals.find(j => j.journalName === journalName);
    if (journal) {
        setSelectedJournal(journal);
        window.scrollTo(0, 0);
    }
  }, [journals]);

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedJournal(null);
  };
  
  const handleBackToJournalList = () => {
    setSelectedJournal(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading journal data...</p>
      </div>
    );
  }
  
  if (selectedJournal) {
      return (
        <div className="py-4 md:py-8">
            <JournalDetail 
                journal={selectedJournal} 
                onBack={handleBackToJournalList}
                onJournalSelect={handleJournalSelectByName}
            />
        </div>
      )
  }

  return (
    <div className="py-4 md:py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          Academic Journal Index
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Browse journals by category or use the search to find specific titles.
        </p>
         <div className="mt-4 flex gap-2">
            <Button onClick={() => setView('search')} variant={view === 'search' ? 'default' : 'outline'}>Search Journals</Button>
            <Button onClick={() => setView('categories')} variant={view === 'categories' ? 'default' : 'outline'}>Browse Categories</Button>
        </div>
      </div>
     
      {view === 'search' && <div className="max-w-4xl mx-auto"><SearchPage onJournalSelect={handleJournalSelect} /></div>}

      {view === 'categories' && !selectedCategory && (
        <div className="animate-in fade-in-50 duration-300 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedCategories.map(([category, count]) => (
                <Card
                key={category}
                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 flex flex-col"
                onClick={() => handleCategorySelect(category)}
                >
                <CardHeader className="flex-grow">
                    <CardTitle className="font-headline text-xl">{category}</CardTitle>
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
      )}

      {view === 'categories' && selectedCategory && (
        <div className="animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={handleBackToCategories}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">{selectedCategory}</h2>
          </div>
          <div className="space-y-4">
            {paginatedJournals.map((journal) => (
                <Card 
                    key={journal.issn}
                    className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-shadow"
                    onClick={() => handleJournalSelect(journal)}
                >
                  <CardContent className="p-4 grid grid-cols-12 items-center gap-4">
                    <div className="col-span-8">
                        <p className="font-headline text-base font-semibold truncate">{journal.journalName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{journal.issn}</p>
                    </div>
                    <div className="col-span-2 text-center">
                        <p className="text-xs text-muted-foreground font-semibold">Impact Factor</p>
                        <p className="font-medium text-base">{journal.impactFactor}</p>
                    </div>
                    <div className="col-span-2 text-center">
                        <p className="text-xs text-muted-foreground font-semibold">CAS Partition</p>
                        <Badge variant={getPartitionBadgeVariant(journal.majorCategoryPartition)} className="flex items-center justify-center gap-1">
                            {journal.authorityJournal === "一级" && <Crown className="h-3 w-3" />}
                            {partitionMap[journal.majorCategoryPartition.charAt(0)] || journal.majorCategoryPartition}
                        </Badge>
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
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {getPaginationItems(currentPage, totalPages, handlePageChange)}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} 
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
