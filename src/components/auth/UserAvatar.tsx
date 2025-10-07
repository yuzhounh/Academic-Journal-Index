"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import LoginDialog from "./LoginDialog";

interface UserAvatarProps {
  onViewFavorites: () => void;
}

export default function UserAvatar({ onViewFavorites }: UserAvatarProps) {
  const { user, auth } = useFirebase();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!user) {
    return (
      <>
        <Button variant="outline" onClick={() => setIsLoginDialogOpen(true)}>
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
        <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      </>
    );
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-9 w-9">
          <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
            <p className="font-medium">{user.displayName || "User"}</p>
            <p className="text-xs text-muted-foreground font-normal truncate">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
