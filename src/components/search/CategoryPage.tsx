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
import { ArrowLeft, BookText, Loader2, TrendingUp } from "lucide-react";
import JournalDetail from "./JournalDetail";
import SearchPage from "./SearchPage";

const JOURNALS_PER_PAGE = 20;

const partitionMap: { [key: string]: string } = {
  "1": "一区",
  "2": "二区",
  "3": "三区",
  "4": "四区",
};

const getPartitionBadgeVariant = (journal: Journal) => {
    const partition = journal.majorCategoryPartition.charAt(0);
    if (partition === '1') {
      return "level1";
    }
    if (partition === '2') {
      if (journal.authorityJournal === '一级权威期刊') {
        return "level1";
      }
      return "level2";
    }
    if (partition === '3') {
        return "level2";
    }
    if (partition === '4') {
        return "level3";
    }
    return "secondary";
};

// Helper function to generate pagination items
const getPaginationItems = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
    const pages = [];
    const pageLimit = 5; 
    const ellipsis = <PaginationItem key="ellipsis-start-end"><PaginationEllipsis /></PaginationItem>;

    if (totalPages <= pageLimit + 2) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(i); }} isActive={currentPage === i}>
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }
    } else {
        // Always show first page
        pages.push(
            <PaginationItem key={1}>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(1); }} isActive={currentPage === 1}>
                    1
                </PaginationLink>
            </PaginationItem>
        );

        let startPage, endPage;
        if (currentPage <= pageLimit - 2) {
            startPage = 2;
            endPage = pageLimit -1;
            pages.push(...Array.from({ length: (endPage - startPage + 1)}, (_, i) => startPage + i).map(p => 
                <PaginationItem key={p}>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(p); }} isActive={currentPage === p}>
                        {p}
                    </PaginationLink>
                </PaginationItem>
            ));
            pages.push(ellipsis);
        } else if (currentPage > totalPages - (pageLimit - 2)) {
            startPage = totalPages - (pageLimit-2);
            endPage = totalPages - 1;
            pages.push(ellipsis);
            pages.push(...Array.from({ length: (endPage - startPage + 1)}, (_, i) => startPage + i).map(p => 
                <PaginationItem key={p}>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(p); }} isActive={currentPage === p}>
                        {p}
                    </PaginationLink>
                </PaginationItem>
            ));
        } else {
            startPage = currentPage - Math.floor((pageLimit-3)/2);
            endPage = currentPage + Math.floor((pageLimit-3)/2);
            pages.push(ellipsis);
            pages.push(...Array.from({ length: (endPage - startPage + 1)}, (_, i) => startPage + i).map(p => 
                <PaginationItem key={p}>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(p); }} isActive={currentPage === p}>
                        {p}
                    </PaginationLink>
                </PaginationItem>
            ));
            pages.push(ellipsis);
        }
        
        // Always show last page
        pages.push(
            <PaginationItem key={totalPages}>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(totalPages); }} isActive={currentPage === totalPages}>
                    {totalPages}
                </PaginationLink>
            </PaginationItem>
        );
    }
    return pages;
};


export default function CategoryPage() {
  const { journals, loading } = useJournals();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<'categories' | 'search'>('categories');

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
            const factorA = typeof a.impactFactor === 'number' ? a.impactFactor : 0;
            const factorB = typeof b.impactFactor === 'number' ? b.impactFactor : 0;
            return factorB - factorA;
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading journal data...</p>
      </div>
    );
  }
  
  if (selectedJournal) {
      return (
        <div className="container mx-auto p-4 md:p-8">
            <JournalDetail 
                journal={selectedJournal} 
                onBack={handleBackToJournalList}
                onJournalSelect={handleJournalSelectByName}
            />
        </div>
      )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          Academic Journal Index
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Browse journals by category or use the search to find specific titles.
        </p>
         <div className="mt-4 flex gap-2">
          <Button onClick={() => setView('categories')} variant={view === 'categories' ? 'default' : 'outline'}>Browse Categories</Button>
          <Button onClick={() => setView('search')} variant={view === 'search' ? 'default' : 'outline'}>Search Journals</Button>
        </div>
      </div>
     
      {view === 'search' && <SearchPage />}

      {view === 'categories' && !selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in-50 duration-300">
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
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                          <p className="font-headline text-base font-semibold">{journal.journalName}</p>
                          <p className="text-xs text-muted-foreground mt-1">{journal.issn}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-center">
                          <div>
                              <p className="text-xs text-muted-foreground font-semibold">Impact Factor</p>
                              <p className="font-medium text-base">{journal.impactFactor}</p>
                          </div>
                          <div>
                              <p className="text-xs text-muted-foreground font-semibold">CAS Partition</p>
                              <Badge variant={getPartitionBadgeVariant(journal)}>
                                  {partitionMap[journal.majorCategoryPartition.charAt(0)] || journal.majorCategoryPartition}
                              </Badge>
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
