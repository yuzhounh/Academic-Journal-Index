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
import { ArrowLeft, BookText, Loader2 } from "lucide-react";
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
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">{journal.journalName}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                        <div>
                            <p className="text-xs text-muted-foreground font-semibold">Impact Factor</p>
                            <p className="font-medium text-base">{journal.impactFactor}</p>
                        </div>
                         <div>
                            <p className="text-xs text-muted-foreground font-semibold">CAS Major Partition</p>
                            <Badge variant={getPartitionBadgeVariant(journal)}>
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
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                        <PaginationLink 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                            isActive={currentPage === page}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
