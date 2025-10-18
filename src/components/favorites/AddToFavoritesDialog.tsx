
"use client";

import { useState, useEffect } from "react";
import { useFirebase } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollection, WithId } from "@/firebase/firestore/use-collection";
import {
  collection,
  query,
  orderBy,
  doc,
  writeBatch,
  serverTimestamp,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Journal } from "@/data/journals";
import { JournalList } from "./FavoritesContent";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/provider";

interface AddToFavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journal: Journal;
}

export default function AddToFavoritesDialog({
  open,
  onOpenChange,
  journal,
}: AddToFavoritesDialogProps) {
  const { user, firestore } = useFirebase();
  const { t } = useTranslation();
  const [newList, setNewList] = useState("");
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  const { data: journalLists } = useCollection<JournalList>(journalListsQuery);

  const favoritedInListsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, `users/${user.uid}/favorite_journals`),
            where("journalId", "==", journal.issn)
          )
        : null,
    [user, firestore, journal.issn]
  );
  const { data: favoritedIn, isLoading: isLoadingFavorites } = useCollection<{listId: string}>(favoritedInListsQuery);

  useEffect(() => {
    if (favoritedIn) {
        const listIds = new Set(favoritedIn.map((fav) => fav.listId).filter(Boolean));
        setSelectedLists(listIds);
    }
  }, [favoritedIn]);

  const handleCreateAndAdd = async () => {
    if (!newList.trim() || !user || !firestore) return;
    setIsCreating(true);

    try {
      // Step 1: Create the new list and get its ID
      const newListRef = await addDoc(collection(firestore, `users/${user.uid}/journal_lists`), {
        name: newList.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      const newListId = newListRef.id;

      // Step 2: Create a new batch to add the favorite and handle uncategorized entries
      const batch = writeBatch(firestore);
      const favoriteId = `${journal.issn}_${newListId}`;
      const favoriteRef = doc(firestore, `users/${user.uid}/favorite_journals`, favoriteId);
      
      // Check if an uncategorized favorite exists for this journal
      const uncategorizedQuery = query(
        collection(firestore, `users/${user.uid}/favorite_journals`), 
        where('journalId', '==', journal.issn), 
        where('listId', '==', '')
      );
      const uncategorizedDocs = await getDocs(uncategorizedQuery);
      
      if (!uncategorizedDocs.empty) {
        // If an uncategorized version exists, delete it as it's now being categorized.
        batch.delete(uncategorizedDocs.docs[0].ref);
      }

      // Add the journal to the new list
      batch.set(favoriteRef, {
        journalId: journal.issn,
        userId: user.uid,
        listId: newListId,
        createdAt: serverTimestamp(),
        // Denormalized journal data for list view
        journalName: journal.journalName,
        impactFactor: journal.impactFactor,
        majorCategoryPartition: journal.majorCategoryPartition,
        authorityJournal: journal.authorityJournal,
        openAccess: journal.openAccess,
        issn: journal.issn,
        majorCategory: journal.majorCategory,
        top: journal.top,
      });
      
      // Commit the second batch
      await batch.commit();
      
      // Update local state to reflect the new list being selected
      setSelectedLists(prev => {
        const newSet = new Set(prev);
        newSet.add(newListId);
        return newSet;
      });

      setNewList("");
    } catch (error) {
      console.error("Error creating new list and adding favorite:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !firestore) return;
    setIsSaving(true);
    
    const initialListIds = new Set((favoritedIn || []).map(fav => fav.listId).filter(Boolean));
    
    const listsToAdd = new Set([...selectedLists].filter(id => !initialListIds.has(id)));
    const listsToRemove = new Set([...initialListIds].filter(id => !selectedLists.has(id)));

    try {
        const batch = writeBatch(firestore);

        // Add to new lists
        listsToAdd.forEach(listId => {
            const favoriteId = `${journal.issn}_${listId}`;
            const favoriteRef = doc(firestore, `users/${user.uid}/favorite_journals`, favoriteId);
            batch.set(favoriteRef, {
                journalId: journal.issn,
                userId: user.uid,
                listId: listId,
                createdAt: serverTimestamp(),
                journalName: journal.journalName,
                impactFactor: journal.impactFactor,
                majorCategoryPartition: journal.majorCategoryPartition,
                authorityJournal: journal.authorityJournal,
                openAccess: journal.openAccess,
                issn: journal.issn,
                majorCategory: journal.majorCategory,
                top: journal.top,
            });
        });

        // Remove from old lists
        if (listsToRemove.size > 0) {
            const q = query(
                collection(firestore, `users/${user.uid}/favorite_journals`),
                where('journalId', '==', journal.issn),
                where('listId', 'in', Array.from(listsToRemove))
            );
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
        // Handle uncategorized state
        const isCurrentlyInAnyList = initialListIds.size > 0;
        const willBeInAnyList = selectedLists.size > 0;

        if (willBeInAnyList) {
            // If it's going into lists, ensure any uncategorized version is removed.
            const uncategorizedQuery = query(collection(firestore, `users/${user.uid}/favorite_journals`), where('journalId', '==', journal.issn), where('listId', '==', ''));
            const uncategorizedDocs = await getDocs(uncategorizedQuery);
            if (!uncategorizedDocs.empty) {
                batch.delete(uncategorizedDocs.docs[0].ref);
            }
        } else if (isCurrentlyInAnyList && !willBeInAnyList) {
            // If it was in lists but now is in none, it becomes uncategorized.
            const uncategorizedFavoriteId = `${journal.issn}_uncategorized`;
            const uncategorizedRef = doc(firestore, `users/${user.uid}/favorite_journals`, uncategorizedFavoriteId);
             batch.set(uncategorizedRef, {
                journalId: journal.issn,
                userId: user.uid,
                listId: "", // Explicitly uncategorized
                createdAt: serverTimestamp(),
                journalName: journal.journalName,
                impactFactor: journal.impactFactor,
                majorCategoryPartition: journal.majorCategoryPartition,
                authorityJournal: journal.authorityJournal,
                openAccess: journal.openAccess,
                issn: journal.issn,
                majorCategory: journal.majorCategory,
                top: journal.top,
            });
        } else if (!isCurrentlyInAnyList && !willBeInAnyList) {
            // First time favoriting, but into no list -> uncategorized
            const isAlreadyFavoritedUncategorizedQuery = query(collection(firestore, `users/${user.uid}/favorite_journals`), where('journalId', '==', journal.issn));
            const isAlreadyFavoritedUncategorizedDocs = await getDocs(isAlreadyFavoritedUncategorizedQuery);

            if (isAlreadyFavoritedUncategorizedDocs.empty) {
                const uncategorizedFavoriteId = `${journal.issn}_uncategorized`;
                const uncategorizedRef = doc(firestore, `users/${user.uid}/favorite_journals`, uncategorizedFavoriteId);
                batch.set(uncategorizedRef, {
                    journalId: journal.issn,
                    userId: user.uid,
                    listId: "",
                    createdAt: serverTimestamp(),
                    journalName: journal.journalName,
                    impactFactor: journal.impactFactor,
                    majorCategoryPartition: journal.majorCategoryPartition,
                    authorityJournal: journal.authorityJournal,
                    openAccess: journal.openAccess,
                    issn: journal.issn,
                    majorCategory: journal.majorCategory,
                    top: journal.top,
                });
            }
        }


        await batch.commit();
        onOpenChange(false);
    } catch (error) {
        console.error("Error updating favorites:", error);
    } finally {
        setIsSaving(false);
    }
};

  const onCheckedChange = (checked: boolean | "indeterminate", listId: string) => {
    setSelectedLists(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(listId);
        } else {
            newSet.delete(listId);
        }
        return newSet;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('favorites.dialog.title', { journalName: journal.journalName })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Input
                    placeholder={t('favorites.dialog.newListPlaceholder')}
                    value={newList}
                    onChange={(e) => setNewList(e.target.value)}
                    disabled={isCreating}
                />
                <Button onClick={handleCreateAndAdd} disabled={!newList.trim() || isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('favorites.dialog.createButton')}
                </Button>
            </div>

            <ScrollArea className="h-40 rounded-md border p-2">
                <div className="space-y-2">
                {(journalLists || []).map((list: WithId<JournalList>) => (
                    <div key={list.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary">
                        <Checkbox
                            id={list.id}
                            checked={selectedLists.has(list.id)}
                            onCheckedChange={(checked) => onCheckedChange(checked, list.id)}
                            disabled={isLoadingFavorites}
                        />
                        <label htmlFor={list.id} className="text-sm font-medium leading-none cursor-pointer">
                            {list.name}
                        </label>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('favorites.dialog.saveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
