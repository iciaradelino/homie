'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user profile interface
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  lifestyle: {
    preferredNeighborhoods?: string[];
    maxCommute?: string;
    workLocation?: string;
    transportPreference?: string;
    socialPreference?: string;
    outdoorSpaces?: boolean;
    noisePreference?: string;
    dailyRoutine?: string;
    workFromHome?: boolean;
    petOwner?: boolean;
    cuisineImportance?: string;
  };
  createdAt: string;
}

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  setUser: (user: UserProfile | null) => void;
  updateUserLifestyle: (lifestyleData: Partial<UserProfile['lifestyle']>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('homie_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        localStorage.removeItem('homie_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('homie_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('homie_user');
    }
  }, [user]);

  // Check if user has completed their profile
  const isProfileComplete = user !== null && Object.keys(user.lifestyle).length > 0;

  // Update user lifestyle data
  const updateUserLifestyle = (lifestyleData: Partial<UserProfile['lifestyle']>) => {
    if (!user) return;

    setUser({
      ...user,
      lifestyle: {
        ...user.lifestyle,
        ...lifestyleData
      }
    });
  };

  // Logout user
  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isProfileComplete,
        setUser,
        updateUserLifestyle,
        logout
      }}
    >
      {!isLoading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 