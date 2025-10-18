
"use client";

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/provider';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';

interface DeleteJournalListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  listName: string;
}

export default function DeleteJournalListDialog({ open, onOpenChange, listId, listName }: DeleteJournalListDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteList = async () => {
    if (!user || !firestore || !listId) return;

    setIsDeleting(true);
    try {
      const batch = writeBatch(firestore);

      // 1. Delete the journal list document
      const listRef = doc(firestore, `users/${user.uid}/journal_lists`, listId);
      batch.delete(listRef);

      // 2. Find all favorite entries associated with this list
      const favoritesQuery = query(
        collection(firestore, `users/${user.uid}/favorite_journals`),
        where('listId', '==', listId)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);

      // 3. Delete old favorite entries and create new uncategorized ones
      favoritesSnapshot.forEach((favDoc) => {
        // Delete the old favorite entry from the list
        batch.delete(favDoc.ref);

        // Create a new uncategorized entry.
        // IMPORTANT: Sanitize the journalId to prevent invalid document paths.
        const journalIdWithSlash = favDoc.data().journalId;
        const journalId = journalIdWithSlash.split('/')[0]; // Use only the ISSN part
        const uncategorizedFavoriteId = `${journalId}_uncategorized`;
        const uncategorizedRef = doc(firestore, `users/${user.uid}/favorite_journals`, uncategorizedFavoriteId);
        
        batch.set(uncategorizedRef, {
            journalId: journalId, // Store the sanitized ID
            userId: user.uid,
            createdAt: favDoc.data().createdAt // Preserve original favorite date
        }, { merge: true }); // Use merge to not overwrite if it already exists
      });

      await batch.commit();

      toast({
        title: t('favorites.deleteList.successTitle'),
        description: t('favorites.deleteList.successDescription', { listName }),
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting journal list:", error);
      toast({
        variant: 'destructive',
        title: t('favorites.deleteList.errorTitle'),
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('favorites.deleteList.title', { listName })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('favorites.deleteList.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            asChild
            disabled={isDeleting}
            onClick={handleDeleteList}
          >
            <Button variant="destructive">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('favorites.deleteList.confirmButton')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
