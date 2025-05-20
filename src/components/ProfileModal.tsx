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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, UserProfile } from '@/context/UserContext';
import { CheckCircle2, User2, MapPin, Clock, Bus, Users, Leaf, Volume2, Calendar, Home, Dog, Coffee, Mail, KeyRound } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: 'signup' | 'search';
}

export default function ProfileModal({ isOpen, onClose, source }: ProfileModalProps) {
  const { setUser } = useUser();
  const [step, setStep] = useState(1);
  const totalSteps = 4; // Increased by 1 for the account details step
  
  // Account form state
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  // Lifestyle form state
  const [formData, setFormData] = useState({
    preferredNeighborhoods: [],
    maxCommute: '',
    workLocation: '',
    transportPreference: '',
    socialPreference: '',
    outdoorSpaces: false,
    noisePreference: '',
    dailyRoutine: '',
    workFromHome: false,
    petOwner: false,
    cuisineImportance: '',
  });

  // Handle account input changes
  const handleAccountChange = (field: string, value: string) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle lifestyle input changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  // Create new user profile and save to context
  const handleSubmit = () => {
    const newUser: UserProfile = {
      id: Math.random().toString(36).substring(2, 15),
      name: accountData.name,
      email: accountData.email,
      lifestyle: { ...formData },
      createdAt: new Date().toISOString(),
    };
    
    setUser(newUser);
    onClose();
    
    // If coming from search button, redirect to search page
    if (source === 'search') {
      window.location.href = '/search';
    }
  };

  // Move to next step
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  // Move to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    if (step === 1) {
      return (
        accountData.name.trim() !== '' && 
        accountData.email.trim() !== '' && 
        accountData.email.includes('@') && 
        accountData.password.length >= 6
      );
    }
    if (step === 2) {
      return formData.workLocation.trim() !== '';
    }
    return true; // Other steps are optional
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-homie flex items-center gap-2">
            <User2 className="h-5 w-5" /> 
            {step === 1 ? 'Create Your Account' : 'Create Your Profile'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'First, let\'s set up your account details.'
              : 'Tell us about your lifestyle to get personalized apartment recommendations.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div 
                key={i} 
                className={`flex items-center ${i < totalSteps - 1 ? 'flex-1' : ''}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i + 1 === step 
                      ? 'bg-homie text-white' 
                      : i + 1 < step 
                        ? 'bg-green-100 text-green-600 border border-green-300' 
                        : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {i + 1 < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div 
                    className={`h-1 flex-1 mx-2 ${i + 1 < step ? 'bg-green-300' : 'bg-gray-200'}`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User2 className="h-4 w-4 text-homie" />
                  Your Name
                </label>
                <Input 
                  placeholder="Enter your full name"
                  value={accountData.name}
                  onChange={(e) => handleAccountChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Mail className="h-4 w-4 text-homie" />
                  Email Address
                </label>
                <Input 
                  type="email"
                  placeholder="Enter your email address"
                  value={accountData.email}
                  onChange={(e) => handleAccountChange('email', e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <KeyRound className="h-4 w-4 text-homie" />
                  Password
                </label>
                <Input 
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={accountData.password}
                  onChange={(e) => handleAccountChange('password', e.target.value)}
                />
                {accountData.password && accountData.password.length < 6 && (
                  <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location & Commute Preferences (previously step 1) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 text-homie" />
                  Work/School Location
                </label>
                <Input 
                  placeholder="Enter your work/school address or area"
                  value={formData.workLocation}
                  onChange={(e) => handleChange('workLocation', e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Clock className="h-4 w-4 text-homie" />
                  Maximum Commute Time
                </label>
                <Select 
                  value={formData.maxCommute} 
                  onValueChange={(value) => handleChange('maxCommute', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maximum commute time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15min">Less than 15 minutes</SelectItem>
                    <SelectItem value="30min">15-30 minutes</SelectItem>
                    <SelectItem value="45min">30-45 minutes</SelectItem>
                    <SelectItem value="60min">45-60 minutes</SelectItem>
                    <SelectItem value="60min+">Over 60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Bus className="h-4 w-4 text-homie" />
                  Transportation Preference
                </label>
                <Select 
                  value={formData.transportPreference} 
                  onValueChange={(value) => handleChange('transportPreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transportation preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="publicTransport">Public Transport</SelectItem>
                    <SelectItem value="driving">Driving</SelectItem>
                    <SelectItem value="cycling">Cycling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle Preferences (previously step 2) */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Users className="h-4 w-4 text-homie" />
                  Social Life Preference
                </label>
                <Select 
                  value={formData.socialPreference} 
                  onValueChange={(value) => handleChange('socialPreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select social life preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vibrant">Vibrant nightlife & social scene</SelectItem>
                    <SelectItem value="moderate">Moderate social options</SelectItem>
                    <SelectItem value="quiet">Quiet & residential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Volume2 className="h-4 w-4 text-homie" />
                  Noise Tolerance
                </label>
                <Select 
                  value={formData.noisePreference} 
                  onValueChange={(value) => handleChange('noisePreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select noise tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lowNoise">Very quiet environment</SelectItem>
                    <SelectItem value="moderateNoise">Moderate noise acceptable</SelectItem>
                    <SelectItem value="highNoise">Don't mind urban noise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="outdoorSpaces"
                  className="rounded border-gray-300 text-homie focus:ring-homie"
                  checked={formData.outdoorSpaces}
                  onChange={(e) => handleCheckboxChange('outdoorSpaces', e.target.checked)}
                />
                <label htmlFor="outdoorSpaces" className="flex items-center gap-2 text-sm">
                  <Leaf className="h-4 w-4 text-homie" />
                  Access to parks & outdoor spaces is important to me
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Additional Preferences (previously step 3) */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Calendar className="h-4 w-4 text-homie" />
                  Daily Routine
                </label>
                <Select 
                  value={formData.dailyRoutine} 
                  onValueChange={(value) => handleChange('dailyRoutine', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select typical daily routine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earlyRiser">Early riser</SelectItem>
                    <SelectItem value="9to5">Typical 9-to-5</SelectItem>
                    <SelectItem value="nightOwl">Night owl</SelectItem>
                    <SelectItem value="irregular">Irregular schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="workFromHome"
                  className="rounded border-gray-300 text-homie focus:ring-homie"
                  checked={formData.workFromHome}
                  onChange={(e) => handleCheckboxChange('workFromHome', e.target.checked)}
                />
                <label htmlFor="workFromHome" className="flex items-center gap-2 text-sm">
                  <Home className="h-4 w-4 text-homie" />
                  I frequently work from home
                </label>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="petOwner"
                  className="rounded border-gray-300 text-homie focus:ring-homie"
                  checked={formData.petOwner}
                  onChange={(e) => handleCheckboxChange('petOwner', e.target.checked)}
                />
                <label htmlFor="petOwner" className="flex items-center gap-2 text-sm">
                  <Dog className="h-4 w-4 text-homie" />
                  I have pets or plan to have pets
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Coffee className="h-4 w-4 text-homie" />
                  Importance of Restaurant/Café Access
                </label>
                <Select 
                  value={formData.cuisineImportance} 
                  onValueChange={(value) => handleChange('cuisineImportance', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How important is food access?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veryImportant">Very important - I eat out often</SelectItem>
                    <SelectItem value="important">Important - I enjoy good options nearby</SelectItem>
                    <SelectItem value="neutral">Neutral - It's nice but not essential</SelectItem>
                    <SelectItem value="notImportant">Not important - I rarely eat out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={step === 1 ? onClose : handleBack}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!isCurrentStepValid()}
          >
            {step < totalSteps ? 'Next' : 'Complete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 