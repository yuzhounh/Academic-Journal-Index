
"use client";

import { useMemo, useState } from "react";
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
import { BookText, FolderOpen, LogIn, Pencil, Trash2 } from "lucide-react";
import CategoryStats from "../search/CategoryStats";
import DeleteJournalListDialog from "./DeleteJournalListDialog";
import RenameJournalListDialog from "./RenameJournalListDialog";

export type JournalList = {
    name: string;
    userId: string;
};

type FavoriteJournalEntry = {
    journalId: string;
    listId?: string;
};


interface FavoritesContentProps {
    onJournalListSelect: (list: WithId<JournalList>) => void;
    onUncategorizedSelect: () => void;
    allFavorites: WithId<FavoriteJournalEntry>[] | null;
    onFindJournalsClick: () => void;
    onLoginClick: () => void;
    journals: Journal[];
}

export default function FavoritesContent({ onJournalListSelect, onUncategorizedSelect, allFavorites, onFindJournalsClick, onLoginClick, journals }: FavoritesContentProps) {
    const { user, isUserLoading, firestore } = useFirebase();
    const { t } = useTranslation();
    const [deleteDialogState, setDeleteDialogState] = useState<{open: boolean, listId: string, listName: string}>({open: false, listId: '', listName: ''});
    const [renameDialogState, setRenameDialogState] = useState<{open: boolean, listId: string, listName: string}>({open: false, listId: '', listName: ''});
    
    // IMPORTANT: All hooks are now called unconditionally at the top.
    const journalListsQuery = useMemoFirebase(
        () =>
          user && firestore
            ? query(
                collection(firestore, `users/${user.uid}/journal_lists`),
                orderBy("name", "asc")
              )
            : null,
        [user, firestore]
    );
    
    const { data: journalLists, isLoading: isLoadingLists } = useCollection<JournalList>(journalListsQuery);
    
    const { categorized, uncategorizedCount } = useMemo(() => {
        if (!allFavorites) return { categorized: {}, uncategorizedCount: 0 };

        const categorizedFavorites: Record<string, number> = {};
        let uncategorized = 0;

        allFavorites.forEach(fav => {
            if (fav.listId && fav.listId.trim() !== '') {
                categorizedFavorites[fav.listId] = (categorizedFavorites[fav.listId] || 0) + 1;
            } else {
                uncategorized++;
            }
        });

        return { categorized: categorizedFavorites, uncategorizedCount: uncategorized };
    }, [allFavorites]);
    
    const journalsForStats = useMemo(() => {
        if (!allFavorites) return [];
        const journalMap = new Map(journals.map(j => [j.issn.split('/')[0], j]));
        return allFavorites
            .map(fav => journalMap.get(fav.journalId))
            .filter((j): j is Journal => !!j);
    }, [allFavorites, journals]);

    const handleDeleteClick = (e: React.MouseEvent, list: WithId<JournalList>) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        setDeleteDialogState({ open: true, listId: list.id, listName: list.name });
    };

    const handleRenameClick = (e: React.MouseEvent, list: WithId<JournalList>) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        setRenameDialogState({ open: true, listId: list.id, listName: list.name });
    };


    // Conditional rendering logic now comes AFTER all hooks have been called.
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
                <Button onClick={onLoginClick}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('auth.login')}
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in-50 duration-300">
            {allFavorites && allFavorites.length > 0 ? (
                <div className="space-y-8">
                    <CategoryStats journals={journalsForStats} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {uncategorizedCount > 0 && (
                            <Card
                                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 flex flex-col"
                                onClick={onUncategorizedSelect}
                            >
                                <CardHeader className="flex-grow pb-2">
                                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                                       <FolderOpen /> {t('favorites.uncategorized')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <BookText className="w-4 h-4 mr-2" />
                                        <span>
                                            {uncategorizedCount} {t('categories.journals')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {(journalLists || []).map((list) => (
                           <Card
                            key={list.id}
                            className="group relative cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 flex flex-col"
                            onClick={() => onJournalListSelect(list)}
                            >
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        onClick={(e) => handleRenameClick(e, list)}
                                        aria-label={t('favorites.renameList.ariaLabel', { listName: list.name })}
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => handleDeleteClick(e, list)}
                                        aria-label={t('favorites.deleteList.ariaLabel', { listName: list.name })}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                                <CardHeader className="flex-grow pb-2">
                                    <CardTitle className="font-headline text-xl">
                                    {list.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                    <BookText className="w-4 h-4 mr-2" />
                                    <span>
                                        {categorized[list.id] || 0} {t('categories.journals')}
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
                    <Button className="mt-6" onClick={onFindJournalsClick}>
                       {t('favorites.empty.button')}
                    </Button>
                </div>
            )}
            {deleteDialogState.open && (
                <DeleteJournalListDialog
                    open={deleteDialogState.open}
                    onOpenChange={(open) => setDeleteDialogState({ ...deleteDialogState, open })}
                    listId={deleteDialogState.listId}
                    listName={deleteDialogState.listName}
                />
            )}
            {renameDialogState.open && (
                <RenameJournalListDialog
                    open={renameDialogState.open}
                    onOpenChange={(open) => setRenameDialogState({ ...renameDialogState, open })}
                    listId={renameDialogState.listId}
                    listName={renameDialogState.listName}
                />
            )}
        </div>
    );
}
