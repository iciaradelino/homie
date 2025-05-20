'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';

export default function UserAvatar() {
  const { user, logout } = useUser();
  
  // Get initials from user name for display in avatar
  const getInitials = () => {
    if (!user) return 'U';
    
    // If user has a name, get initials from name
    if (user.name) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      } else {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
    }
    
    // Fallback to user ID
    return user.id.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-homie/10 hover:bg-homie/20"
        >
          <span className="text-homie font-medium">{getInitials()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => window.location.href = '/profile'}
          className="cursor-pointer"
        >
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => window.location.href = '/favorites'}
          className="cursor-pointer"
        >
          Saved Apartments
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={logout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 