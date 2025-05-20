'use client';

import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import { Mail, KeyRound, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpClick: () => void;
}

export default function LoginModal({ isOpen, onClose, onSignUpClick }: LoginModalProps) {
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user changes input
  };

  // Mock login function (in a real app, this would communicate with a backend)
  const handleLogin = () => {
    // For demo purposes, just check if the email format is valid
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // For demo purposes, check password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // In a real app, you would validate credentials against a database
    // For this demo, we'll just create a dummy user object
    const user = {
      id: Math.random().toString(36).substring(2, 15),
      email: formData.email,
      name: formData.email.split('@')[0], // Use part of email as name
      lifestyle: {},
      createdAt: new Date().toISOString(),
    };

    // Set the user in context and close the modal
    setUser(user);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-homie flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Log In to Homie
          </DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Mail className="h-4 w-4 text-homie" />
              Email Address
            </label>
            <Input 
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <KeyRound className="h-4 w-4 text-homie" />
              Password
            </label>
            <Input 
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              <a href="#" className="hover:text-homie">Forgot password?</a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleLogin}
            disabled={!formData.email || !formData.password}
            className="w-full"
          >
            Log In
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button 
              onClick={() => {
                onClose();
                onSignUpClick();
              }} 
              className="text-homie hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 