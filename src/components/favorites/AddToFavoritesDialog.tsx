
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
import { toast } from "@/hooks/use-toast";

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

  const journalId = journal.issn.split('/')[0];

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
            where("journalId", "==", journalId)
          )
        : null,
    [user, firestore, journalId]
  );
  const { data: favoritedIn, isLoading: isLoadingFavorites } = useCollection<{listId: string}>(favoritedInListsQuery);

  useEffect(() => {
    if (favoritedIn) {
        const listIds = new Set(favoritedIn.map((fav) => fav.listId).filter(Boolean));
        setSelectedLists(listIds);
    }
  }, [favoritedIn]);

  const handleCreateNewList = async () => {
    if (!newList.trim() || !user || !firestore) return;
    setIsCreating(true);
  
    try {
      const newListRef = await addDoc(collection(firestore, `users/${user.uid}/journal_lists`), {
        name: newList.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      // Auto-select the newly created list
      setSelectedLists(prev => new Set(prev).add(newListRef.id));
      setNewList(""); // Clear the input field
  
    } catch (error) {
      console.error("Error creating new list:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveChanges = () => {
    if (!user || !firestore) return;

    setIsSaving(true);

    // Immediately close the dialog for a faster UX (Optimistic Update)
    onOpenChange(false);

    // Perform the save operation in the background
    const performSave = async () => {
      try {
        const initialListIds = new Set((favoritedIn || []).map(fav => fav.listId).filter(Boolean));
        
        const listsToAdd = new Set([...selectedLists].filter(id => !initialListIds.has(id)));
        const listsToRemove = new Set([...initialListIds].filter(id => !selectedLists.has(id)));

        const batch = writeBatch(firestore);
        const favoriteBaseData = {
          journalId: journalId,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };

        // Add to new lists
        listsToAdd.forEach(listId => {
            const favoriteId = `${journalId}_${listId}`;
            const favoriteRef = doc(firestore, `users/${user.uid}/favorite_journals`, favoriteId);
            batch.set(favoriteRef, {
                ...favoriteBaseData,
                listId: listId,
            });
        });

        // Remove from old lists
        if (listsToRemove.size > 0) {
            const q = query(
                collection(firestore, `users/${user.uid}/favorite_journals`),
                where('journalId', '==', journalId),
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
        const isAlreadyFavoritedQuery = query(collection(firestore, `users/${user.uid}/favorite_journals`), where('journalId', '==', journalId));
        const isAlreadyFavoritedDocs = await getDocs(isAlreadyFavoritedQuery);
        const isAlreadyFavorited = !isAlreadyFavoritedDocs.empty;
        const wasUncategorized = isAlreadyFavoritedDocs.docs.some(doc => !doc.data().listId);

        if (willBeInAnyList) {
             // If it's going into lists, ensure any uncategorized version is removed.
            if(wasUncategorized) {
                const uncategorizedFavoriteId = `${journalId}_uncategorized`;
                const uncategorizedRef = doc(firestore, `users/${user.uid}/favorite_journals`, uncategorizedFavoriteId);
                batch.delete(uncategorizedRef);
            }
        } else if (isCurrentlyInAnyList && !willBeInAnyList) {
            // If it was in lists but now is in none, it becomes uncategorized.
            const uncategorizedFavoriteId = `${journalId}_uncategorized`;
            const uncategorizedRef = doc(firestore, `users/${user.uid}/favorite_journals`, uncategorizedFavoriteId);
             batch.set(uncategorizedRef, {
                ...favoriteBaseData,
                listId: "", // Explicitly uncategorized
            });
        } else if (!isAlreadyFavorited) {
            // First time favoriting, and into no list -> uncategorized
            const uncategorizedFavoriteId = `${journalId}_uncategorized`;
            const uncategorizedRef = doc(firestore, `users/${user.uid}/favorite_journals`, uncategorizedFavoriteId);
            batch.set(uncategorizedRef, {
                ...favoriteBaseData,
                listId: "",
            });
        }


        await batch.commit();

      } catch (error) {
          console.error("Error updating favorites:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your changes. Please try again.",
          });
      } finally {
          setIsSaving(false);
      }
    };

    performSave();
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
          <DialogTitle>{t('favorites.dialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Input
                    placeholder={t('favorites.dialog.newListPlaceholder')}
                    value={newList}
                    onChange={(e) => setNewList(e.target.value)}
                    disabled={isCreating}
                />
                <Button onClick={handleCreateNewList} disabled={!newList.trim() || isCreating} className="min-w-[100px]">
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('favorites.dialog.createButton')}
                </Button>
            </div>

            <ScrollArea className="h-40 rounded-md border p-2">
                <div className="space-y-2">
                {(journalLists || []).map((list: WithId<JournalList>) => (
                    <label 
                        key={list.id} 
                        htmlFor={list.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                    >
                        <Checkbox
                            id={list.id}
                            checked={selectedLists.has(list.id)}
                            onCheckedChange={(checked) => onCheckedChange(checked, list.id)}
                            disabled={isLoadingFavorites}
                        />
                        <span className="text-sm font-medium leading-none">
                            {list.name}
                        </span>
                    </label>
                ))}
                </div>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-w-[100px]">{t('common.cancel')}</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving} className="min-w-[100px]">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('favorites.dialog.saveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
