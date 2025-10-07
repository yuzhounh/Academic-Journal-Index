"use client";

import { useFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useMemoFirebase } from "@/firebase/provider";

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

export default function FavoritesPage() {
    const { user, isUserLoading, firestore } = useFirebase();
    const router = useRouter();

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

    if (isUserLoading || isLoading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading favorites...</div>
          </div>
        );
    }
    
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center px-4">
                <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
                <p className="text-muted-foreground mb-6">You need to be logged in to view your favorite journals.</p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.push('/')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">My Favorites</h1>
            </div>

            {favorites && favorites.length > 0 ? (
                <div className="space-y-4">
                    {favorites.map((journal) => (
                        <Card key={journal.id}>
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
            ) : (
                <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
                    <h3 className="mt-4 text-lg font-medium text-foreground">No Favorites Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        You haven&apos;t added any journals to your favorites.
                    </p>
                    <Button asChild className="mt-6">
                       <Link href="/">Find Journals to Favorite</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

    