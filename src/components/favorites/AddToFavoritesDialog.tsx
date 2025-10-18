
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
import { addDocumentNonBlocking } from "@/firebase";

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
  const { data: journalLists, setData: setJournalLists } = useCollection<JournalList>(journalListsQuery);

  const favoritedInQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, `users/${user.uid}/favorite_journals`),
            where("journalId", "==", journalId)
          )
        : null,
    [user, firestore, journalId]
  );
  const { data: favoritedIn, isLoading: isLoadingFavorites } = useCollection<{listId: string}>(favoritedInQuery);

  useEffect(() => {
    if (favoritedIn) {
        const listIds = new Set(favoritedIn.map((fav) => fav.listId).filter(Boolean));
        setSelectedLists(listIds);
    }
  }, [favoritedIn]);

  const handleCreateNewList = async () => {
    if (!newList.trim() || !user || !firestore) return;
    setIsCreating(true);

    const listName = newList.trim();
    const tempId = `temp_${Date.now()}`;
    const newListData = {
      name: listName,
      userId: user.uid,
      // We can't use serverTimestamp here for optimistic update, so we use a client-side date
      // The real value will be set by the server.
      createdAt: new Date(), 
    };

    // Optimistic UI update
    setJournalLists(prev => [...(prev || []), { ...newListData, id: tempId }]);
    setSelectedLists(prev => new Set(prev).add(tempId));
    setNewList("");
    setIsCreating(false);

    try {
      const docRef = await addDoc(collection(firestore, `users/${user.uid}/journal_lists`), {
          ...newListData,
          createdAt: serverTimestamp(),
      });

      // Replace temp ID with real ID
      setJournalLists(prev => (prev || []).map(list => list.id === tempId ? { ...list, id: docRef.id } : list));
      setSelectedLists(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          newSet.add(docRef.id);
          return newSet;
      });

    } catch (error) {
      console.error("Error creating new list:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create the new list.",
      });
      // Revert optimistic update
      setJournalLists(prev => (prev || []).filter(list => list.id !== tempId));
      setSelectedLists(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    }
  };

  const handleSaveChanges = () => {
    if (!user || !firestore) return;

    setIsSaving(true);
    onOpenChange(false); // Optimistic UI update

    const performSave = async () => {
      try {
        const batch = writeBatch(firestore);
        
        const favsQuery = query(collection(firestore, `users/${user.uid}/favorite_journals`), where('journalId', '==', journalId));
        const existingFavsSnapshot = await getDocs(favsQuery);
        const existingFavDocs = existingFavsSnapshot.docs;
        const initialListIds = new Set(existingFavDocs.map(doc => doc.data().listId).filter(Boolean));

        const listsToAdd = new Set([...selectedLists].filter(id => !initialListIds.has(id)));
        const listsToRemove = new Set([...initialListIds].filter(id => !selectedLists.has(id)));

        // Handle additions
        listsToAdd.forEach(listId => {
            const favoriteId = `${journalId}_${listId}`;
            const favoriteRef = doc(firestore, `users/${user.uid}/favorite_journals`, favoriteId);
            batch.set(favoriteRef, {
                journalId: journalId,
                userId: user.uid,
                listId: listId,
                createdAt: serverTimestamp(),
            });
        });

        // Handle removals
        existingFavDocs.forEach(doc => {
            const listId = doc.data().listId;
            if (listId && listsToRemove.has(listId)) {
                batch.delete(doc.ref);
            }
        });
        
        // Final check: if after all changes, the journal is in ZERO lists, it should be unfavorited completely.
        const finalNumberOfLists = initialListIds.size + listsToAdd.size - listsToRemove.size;
        
        if (finalNumberOfLists === 0) {
            // It's not in any list, so remove all entries for this journalId
            const allFavsForJournalQuery = query(collection(firestore, `users/${user.uid}/favorite_journals`), where('journalId', '==', journalId));
            const snapshot = await getDocs(allFavsForJournalQuery);
            snapshot.forEach(doc => batch.delete(doc.ref));
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

    // Special case: If journal was NOT favorited and user selects NO lists, it means they want to add to "Uncategorized".
    const wasFavorited = (favoritedIn || []).length > 0;
    if (!wasFavorited && selectedLists.size === 0) {
      const uncategorizedFavoriteId = `${journalId}_uncategorized`;
      const docRef = doc(firestore, `users/${user.uid}/favorite_journals`, uncategorizedFavoriteId);
      addDocumentNonBlocking(docRef, {
          journalId: journalId,
          userId: user.uid,
          listId: "",
          createdAt: serverTimestamp(),
      });
      onOpenChange(false);
    } else {
      performSave();
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
