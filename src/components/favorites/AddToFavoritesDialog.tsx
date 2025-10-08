
"use client";

import { useState, useMemo } from "react";
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

  useMemo(() => {
    if (favoritedIn) {
      const listIds = new Set(favoritedIn.map((fav) => fav.listId));
      setSelectedLists(listIds);
    }
  }, [favoritedIn]);

  const handleCreateAndAdd = async () => {
    if (!newList.trim() || !user || !firestore) return;
    setIsCreating(true);

    try {
      const batch = writeBatch(firestore);
      const newListRef = doc(collection(firestore, `users/${user.uid}/journal_lists`));
      batch.set(newListRef, {
        name: newList.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      const favoriteId = `${journal.issn}_${newListRef.id}`;
      const favoriteRef = doc(firestore, `users/${user.uid}/favorite_journals`, favoriteId);
      batch.set(favoriteRef, {
        journalId: journal.issn,
        userId: user.uid,
        listId: newListRef.id,
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
      
      await batch.commit();
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
    
    const initialListIds = new Set((favoritedIn || []).map(fav => fav.listId));
    
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel', { ns: 'common' })}</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('favorites.dialog.saveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add a cancel translation to the json files
const commonEn = { "cancel": "Cancel" };
const commonZh = { "cancel": "取消" };

