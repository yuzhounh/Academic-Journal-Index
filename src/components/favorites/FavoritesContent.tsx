"use client";

import { useFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemoFirebase } from "@/firebase/provider";
import CategoryStats from "@/components/search/CategoryStats";
import { Journal } from "@/data/journals";
import { useMemo } from "react";

type FavoriteJournal = {
    id: string;
    journalId: string;
    userId: string;
    createdAt: any;
    journalName: string;
    impactFactor: number | string;
    majorCategoryPartition: string;
    authorityJournal: string;
    openAccess: string;
    issn: string;
    // Fields needed for CategoryStats
    majorCategory: string;
    top: string;
};

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

const formatImpactFactor = (factor: number | string) => {
    const num = Number(factor);
    if (!isNaN(num) && String(factor).trim() !== "" && !String(factor).includes('<')) {
      return num.toFixed(1);
    }
    return factor;
};

// Function to adapt FavoriteJournal to the format expected by CategoryStats
const adaptFavoritesForStats = (favorites: FavoriteJournal[]): Journal[] => {
    return favorites.map(fav => ({
        // Map fields from FavoriteJournal to Journal
        journalName: fav.journalName,
        issn: fav.issn,
        impactFactor: fav.impactFactor,
        majorCategoryPartition: fav.majorCategoryPartition,
        authorityJournal: fav.authorityJournal,
        openAccess: fav.openAccess,
        majorCategory: fav.majorCategory || "", // Assume it might not be there, provide default
        top: fav.top || "否",
        // Add dummy values for other required Journal fields
        year: new Date().getFullYear(),
        review: '是',
        oaj: '否',
        webOfScience: '',
        minorCategories: [],
    }));
};

interface FavoritesContentProps {
  onJournalSelect: (journalName: string) => void;
}

export default function FavoritesContent({ onJournalSelect }: FavoritesContentProps) {
    const { user, isUserLoading, firestore } = useFirebase();

    const favoritesQuery = useMemoFirebase(
        () =>
          user && firestore
            ? query(
                collection(firestore, `users/${user.uid}/favorite_journals`),
                orderBy("createdAt", "desc")
              )
            : null,
        [user, firestore]
      );
    
    const { data: favorites, isLoading } = useCollection<FavoriteJournal>(favoritesQuery);
    
    const journalsForStats = useMemo(() => {
        if (favorites) {
            return adaptFavoritesForStats(favorites);
        }
        return [];
    }, [favorites]);

    if (isUserLoading || isLoading) {
        return (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading favorites...</div>
          </div>
        );
    }
    
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center text-center px-4 py-20 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
                <p className="text-muted-foreground mb-6">You need to be logged in to view your favorite journals.</p>
                <Button>Back to Home</Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in-50 duration-300">
            {favorites && favorites.length > 0 ? (
                <div className="space-y-8">
                    <CategoryStats journals={journalsForStats} />
                    <div className="space-y-4">
                        {favorites.map((journal) => (
                            <Card key={journal.id} onClick={() => onJournalSelect(journal.journalName)} className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-shadow">
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
                </div>
            ) : (
                <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
                    <h3 className="mt-4 text-lg font-medium text-foreground">No Favorites Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        You haven&apos;t added any journals to your favorites.
                    </p>
                    <Button className="mt-6">
                       Find Journals to Favorite
                    </Button>
                </div>
            )}
        </div>
    );
}
