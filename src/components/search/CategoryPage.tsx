

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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowLeft, BookText, Crown, Medal, Star, BookOpen, Menu, Folder } from "lucide-react";
import JournalDetail from "./JournalDetail";
import SearchPage from "./SearchPage";
import CategoryStats from "./CategoryStats";
import { cn } from "@/lib/utils";
import UserAvatar from "../auth/UserAvatar";
import { useFirebase } from "@/firebase";
import FavoritesContent, { JournalList } from "../favorites/FavoritesContent";
import AboutPage from "./AboutPage";
import { ThemeToggle } from "../theme/ThemeToggle";
import { LanguageToggle } from "../theme/LanguageToggle";
import { useTranslation } from "@/i18n/provider";
import { getMajorCategoryName, getMinorCategoryName } from "@/i18n/categories";
import { useCollection, WithId } from "@/firebase/firestore/use-collection";
import { collection, query, where, or } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

const JOURNALS_PER_PAGE = 20;

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
    const { t } = useTranslation();
    let icon;
    let variant: "authority1" | "authority2" | "authority3" | "secondary" = "secondary";
    let levelText = level;
    if (level === "一级") levelText = t('cas.authority.1');
    if (level === "二级") levelText = t('cas.authority.2');
    if (level === "三级") levelText = t('cas.authority.3');

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
            <span className="text-xs whitespace-nowrap">{levelText}</span>
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
  const match = partition.match(/(\d+)\//);
  return match ? parseInt(match[1], 10) : Infinity;
};

interface CategoryPageProps {
  journals: Journal[];
}

const formatImpactFactor = (factor: number | string) => {
  const num = Number(factor);
  if (!isNaN(num) && String(factor).trim() !== "" && !String(factor).includes('<')) {
    return num.toFixed(1);
  }
  return factor;
};

const formatIssn = (issn: string) => {
    const parts = issn.split('/');
    if (parts.length > 1) {
        return <>{parts[0]}/<wbr/>{parts.slice(1).join('/')}</>;
    }
    return issn;
};

export default function CategoryPage({ journals }: CategoryPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [selectedJournalList, setSelectedJournalList] = useState<WithId<JournalList> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<'search' | 'categories' | 'favorites' | 'about'>("search");
  const { user, firestore } = useFirebase();
  const { t, locale } = useTranslation();
  
  const [preservedSearchTerm, setPreservedSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


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

  // For Favorites view - get all favorite journals first
  const allFavoritesQuery = useMemoFirebase(
      () =>
        user && firestore
          ? query(collection(firestore, `users/${user.uid}/favorite_journals`))
          : null,
      [user, firestore]
  );
  const { data: allFavorites } = useCollection<Journal & { journalId: string; listId?: string }>(allFavoritesQuery);


  // For Browse view
  const journalsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory === "Uncategorized") {
        return (allFavorites || []).filter(fav => !fav.listId || fav.listId === '').sort((a, b) => {
          const factorA = typeof a.impactFactor === 'number' ? a.impactFactor : 0;
          const factorB = typeof b.impactFactor === 'number' ? b.impactFactor : 0;
          return factorB - factorA;
        });
    }
    return journals
      .filter((j) => j.majorCategory === selectedCategory)
      .sort((a, b) => {
        const rankA = extractRank(a.majorCategoryPartition);
        const rankB = extractRank(b.majorCategoryPartition);
        return rankA - rankB;
      });
  }, [journals, selectedCategory, allFavorites]);

  // For Favorites view
  const favoritesInListQuery = useMemoFirebase(
    () => {
      if (!user || !firestore || !selectedJournalList) return null;
      return query(
          collection(firestore, `users/${user.uid}/favorite_journals`),
          where("listId", "==", selectedJournalList.id)
      );
    },
    [user, firestore, selectedJournalList]
  );

  const { data: favoriteJournals } = useCollection<Journal & { journalId: string }>(favoritesInListQuery);

  const journalsForList = useMemo(() => {
    return (favoriteJournals || []).sort((a, b) => {
      const factorA = typeof a.impactFactor === 'number' ? a.impactFactor : 0;
      const factorB = typeof b.impactFactor === 'number' ? b.impactFactor : 0;
      return factorB - factorA;
    });
  }, [favoriteJournals]);

  const journalsToDisplay = (selectedJournalList) ? journalsForList : journalsForCategory;

  const paginatedJournals = useMemo(() => {
    const startIndex = (currentPage - 1) * JOURNALS_PER_PAGE;
    return journalsToDisplay.slice(
      startIndex,
      startIndex + JOURNALS_PER_PAGE
    );
  }, [journalsToDisplay, currentPage]);

  const totalPages = Math.ceil(journalsToDisplay.length / JOURNALS_PER_PAGE);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSelectedJournal(null);
    setSelectedJournalList(null);
  };
  
  const handleJournalListSelect = (list: WithId<JournalList>) => {
    setSelectedJournalList(list);
    setSelectedCategory(null);
    setCurrentPage(1);
    setSelectedJournal(null);
  }

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

  const handleBackToList = () => {
    setSelectedCategory(null);
    setSelectedJournal(null);
    setSelectedJournalList(null);
  };

  const handleBackFromDetail = () => {
    setSelectedJournal(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };
  
  const handleViewChange = (newView: 'search' | 'categories' | 'favorites' | 'about') => {
    setView(newView);
    setSelectedCategory(null);
    setSelectedJournal(null);
    setSelectedJournalList(null);
    setPreservedSearchTerm("");
    setMobileMenuOpen(false);
  }

  const getPartitionText = (partition: string) => {
    const mainPartition = partition.charAt(0);
    if (locale === 'zh') {
      switch (mainPartition) {
          case '1': return t('cas.partitions.1');
          case '2': return t('cas.partitions.2');
          case '3': return t('cas.partitions.3');
          case '4': return t('cas.partitions.4');
          default: return partition;
      }
    } else {
        const match = partition.match(/(\d+)/);
        if (match) {
            return `Q${match[1]}`;
        }
        return partition;
    }
  };

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
      case "favorites":
        if (selectedJournalList || selectedCategory === 'Uncategorized') {
          return (
            <div className="animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={handleBackToList}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Folder className="h-6 w-6 text-primary" />
                  <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">
                    {selectedJournalList?.name || t('favorites.uncategorized')}
                  </h2>
                </div>
              </div>
              <div className="mb-8">
                <CategoryStats journals={journalsToDisplay} />
              </div>
              {paginatedJournals.length > 0 ? (
                <div className="space-y-4">
                  {paginatedJournals.map((journal) => (
                    <Card
                      key={journal.issn}
                      className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-shadow"
                      onClick={() => handleJournalSelect(journal)}
                    >
                      <CardContent className="p-6 grid grid-cols-12 items-start gap-4">
                        <div className="col-span-7">
                          <p className="font-headline text-lg font-semibold truncate">{journal.journalName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">{formatIssn(journal.issn)}</p>
                            <AuthorityBadge level={journal.authorityJournal} />
                            {journal.openAccess === "是" && <Badge variant="openAccess">{t('journal.oa')}</Badge>}
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="text-xs text-muted-foreground font-semibold">{t('journal.impactFactor')}</p>
                          <p className="font-medium text-lg">{formatImpactFactor(journal.impactFactor)}</p>
                        </div>
                        <div className="col-span-3 flex flex-col items-center justify-center text-center">
                          <p className="text-xs text-muted-foreground font-semibold mb-1">{t('journal.casPartitionShort')}</p>
                          <div className={cn("flex items-center font-semibold text-lg", getPartitionColorClass(journal.majorCategoryPartition))}>
                            <span className="ml-1">{getPartitionText(journal.majorCategoryPartition)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">{t('favorites.listEmpty')}</p>
                </div>
              )}
            </div>
          );
        }
        return <FavoritesContent allFavorites={allFavorites} onJournalListSelect={handleJournalListSelect} onUncategorizedSelect={() => handleCategorySelect("Uncategorized")} onFindJournalsClick={() => handleViewChange('search')} />;
      case "about":
        return <AboutPage />;
      case "categories":
        if (selectedCategory) {
          return (
            <div className="animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">
                  {selectedCategory === 'Uncategorized' ? t('favorites.uncategorized') : getMajorCategoryName(selectedCategory, locale)}
                </h2>
              </div>
              <div className="mb-8">
                <CategoryStats journals={journalsToDisplay} />
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
                            {formatIssn(journal.issn)}
                            </p>
                            <AuthorityBadge level={journal.authorityJournal} />
                            {journal.openAccess === "是" && <Badge variant="openAccess">{t('journal.oa')}</Badge>}
                         </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <p className="text-xs text-muted-foreground font-semibold">
                          {t('journal.impactFactor')}
                        </p>
                        <p className="font-medium text-lg">
                          {formatImpactFactor(journal.impactFactor)}
                        </p>
                      </div>
                      <div className="col-span-3 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">
                          {t('journal.casPartitionShort')}
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
                            {getPartitionText(journal.majorCategoryPartition)}
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
                      >
                        {t('pagination.previous')}
                      </PaginationPrevious>
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
                      >
                         {t('pagination.next')}
                      </PaginationNext>
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
                        {getMajorCategoryName(category, locale)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookText className="w-4 h-4 mr-2" />
                        <span>{count} {t('categories.journals')}</span>
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

  const navItems = (
    <>
      <Button
        onClick={() => handleViewChange("search")}
        variant={view === "search" ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        {t('nav.search')}
      </Button>
      <Button
        onClick={() => handleViewChange("categories")}
        variant={view === "categories" ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        {t('nav.browse')}
      </Button>
      {user && (
          <Button 
            onClick={() => handleViewChange("favorites")}
            variant={view === "favorites" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
              {t('nav.favorites')}
          </Button>
      )}
      <Button
          onClick={() => handleViewChange("about")}
          variant={view === "about" ? "secondary" : "ghost"}
          className="w-full justify-start"
      >
          {t('nav.about')}
      </Button>
    </>
  )

  const desktopNavItems = (
    <nav className="hidden sm:flex items-center gap-2">
      <Button
        onClick={() => handleViewChange("search")}
        variant={view === "search" ? "secondary" : "ghost"}
        size="sm"
      >
        {t('nav.search')}
      </Button>
      <Button
        onClick={() => handleViewChange("categories")}
        variant={view === "categories" ? "secondary" : "ghost"}
        size="sm"
      >
        {t('nav.browse')}
      </Button>
      {user && (
          <Button 
            onClick={() => handleViewChange("favorites")}
            variant={view === "favorites" ? "secondary" : "ghost"}
            size="sm"
          >
              {t('nav.favorites')}
          </Button>
      )}
      <Button
          onClick={() => handleViewChange("about")}
          variant={view === "about" ? "secondary" : "ghost"}
          size="sm"
      >
          {t('nav.about')}
      </Button>
    </nav>
  )


  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 text-xl font-bold font-headline">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>AJI</span>
            </a>
            {desktopNavItems}
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <UserAvatar />
            <div className="sm:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                      <a href="/" className="flex items-center gap-2 text-xl font-bold font-headline mb-6">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span>AJI</span>
                      </a>
                      <div className="flex flex-col gap-2">
                        {navItems}
                      </div>
                    </SheetContent>
                </Sheet>
            </div>
          </div>
        </div>
      </header>
      <div className="py-4 md:py-8">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
            {t('header.title')}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            {t('header.subtitle')}
          </p>
        </div>
        {renderContent()}
      </div>
      <footer className="text-center text-sm text-muted-foreground py-4 border-t">
        © 2025 Jing Wang. All Rights Reserved.
      </footer>
    </>
  );
}
