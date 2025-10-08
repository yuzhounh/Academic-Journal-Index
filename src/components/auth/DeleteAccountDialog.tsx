
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
import { deleteUser, User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function DeleteAccountDialog({ open, onOpenChange, user }: DeleteAccountDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // It's critical to delete user data from Firestore first.
      // We will use a Firebase Function for this to ensure all subcollections are deleted.
      const functions = getFunctions();
      const deleteUserData = httpsCallable(functions, 'deleteUserData');
      await deleteUserData();

      // After Firestore data is gone, delete the user from Firebase Auth.
      await deleteUser(user);

      toast({
        title: t('auth.deleteAccountSuccess'),
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        variant: 'destructive',
        title: t('auth.deleteAccountError'),
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
          <AlertDialogTitle>{t('auth.deleteAccountConfirmation.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('auth.deleteAccountConfirmation.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            asChild
            disabled={isDeleting}
            onClick={handleDeleteAccount}
          >
            <Button variant="destructive">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.deleteAccountConfirmation.button')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
