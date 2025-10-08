"use client";

import { useState } from "react";
import { useFirebase } from "@/firebase";
import { useCollection, WithId } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { useMemoFirebase } from "@/firebase/provider";
import { Journal } from "@/data/journals";
import { useTranslation } from "@/i18n/provider";
import { BookText } from "lucide-react";
import CategoryStats from "../search/CategoryStats";

export type JournalList = {
    name: string;
    userId: string;
    createdAt: any;
    journalCount?: number;
};

interface FavoritesContentProps {
    onJournalListSelect: (list: WithId<JournalList>) => void;
}

export default function FavoritesContent({ onJournalListSelect }: FavoritesContentProps) {
    const { user, isUserLoading, firestore } = useFirebase();
    const { t } = useTranslation();

    const journalListsQuery = useMemoFirebase(
        () =>
          user && firestore
            ? query(
                collection(firestore, `users/${user.uid}/journal_lists`),
                orderBy("createdAt", "desc")
              )
            : null,
        [user, firestore]
    );
    
    const { data: journalLists, isLoading: isLoadingLists } = useCollection<JournalList>(journalListsQuery);

    const allFavoritesQuery = useMemoFirebase(
      () =>
        user && firestore
          ? query(collection(firestore, `users/${user.uid}/favorite_journals`))
          : null,
      [user, firestore]
    );
    
    const { data: allFavorites } = useCollection<Journal & { journalId: string }>(allFavoritesQuery);

    if (isUserLoading || isLoadingLists) {
        return (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">{t('favorites.loading')}</div>
          </div>
        );
    }
    
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center text-center px-4 py-20 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-bold mb-4">{t('favorites.login.title')}</h2>
                <p className="text-muted-foreground mb-6">{t('favorites.login.description')}</p>
                <Button>{t('favorites.login.button')}</Button>
            </div>
        );
    }

    const journalsForStats: Journal[] = (allFavorites || []).map(fav => ({
      journalName: fav.journalName,
      issn: fav.issn,
      impactFactor: fav.impactFactor,
      majorCategoryPartition: fav.majorCategoryPartition,
      authorityJournal: fav.authorityJournal,
      openAccess: fav.openAccess,
      majorCategory: fav.majorCategory,
      top: fav.top,
      year: new Date().getFullYear(),
      review: "是",
      oaj: "否",
      webOfScience: "",
      minorCategories: [],
      annotation: "",
    }));


    return (
        <div className="animate-in fade-in-50 duration-300">
            {journalLists && journalLists.length > 0 ? (
                <div className="space-y-8">
                    <CategoryStats journals={journalsForStats} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {journalLists.map((list) => (
                           <Card
                           key={list.id}
                           className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 flex flex-col"
                           onClick={() => onJournalListSelect(list)}
                         >
                           <CardHeader className="flex-grow pb-2">
                             <CardTitle className="font-headline text-xl">
                               {list.name}
                             </CardTitle>
                           </CardHeader>
                           <CardContent>
                             <div className="flex items-center text-sm text-muted-foreground">
                               <BookText className="w-4 h-4 mr-2" />
                               <span>
                                 {list.journalCount || 0} {t('categories.journals')}
                               </span>
                             </div>
                           </CardContent>
                         </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
                    <h3 className="mt-4 text-lg font-medium text-foreground">{t('favorites.empty.title')}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('favorites.empty.description')}
                    </p>
                    <Button className="mt-6">
                       {t('favorites.empty.button')}
                    </Button>
                </div>
            )}
        </div>
    );
}
