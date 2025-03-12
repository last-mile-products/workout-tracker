'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '@/lib/firebase/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { updateUserProfile, completeOnboarding } from '@/lib/firebase/firestore';
import { storage } from '@/lib/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Onboarding steps
const STEPS = ['username', 'profile-picture', 'goals'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureURL, setProfilePictureURL] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetMiles, setTargetMiles] = useState('');
  const [targetStreak, setTargetStreak] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setProfilePictureURL(url);
    }
  };
  
  // Handle next step
  const handleNext = async () => {
    // Validate current step
    if (currentStep === 0 && !username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    // Remove requirement for profile picture
    // Profile picture is now optional to avoid blocking users with CORS issues
    
    if (currentStep === 2) {
      if (!initialWeight || !targetWeight || !targetMiles || !targetStreak) {
        toast.error('Please fill in all fields');
        return;
      }
      
      // Validate numeric inputs
      const weightRegex = /^\d+(\.\d+)?$/;
      if (!weightRegex.test(initialWeight) || !weightRegex.test(targetWeight)) {
        toast.error('Weight must be a valid number');
        return;
      }
      
      if (!weightRegex.test(targetMiles)) {
        toast.error('Miles must be a valid number');
        return;
      }
      
      if (!/^\d+$/.test(targetStreak)) {
        toast.error('Streak days must be a whole number');
        return;
      }
    }
    
    // If we're on the last step, complete onboarding
    if (currentStep === STEPS.length - 1) {
      await completeOnboardingProcess();
      return;
    }
    
    // Move to next step
    setCurrentStep(currentStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Complete onboarding process
  const completeOnboardingProcess = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Upload profile picture to Firebase Storage
      let profilePictureDownloadURL = '';
      
      if (profilePicture) {
        try {
          // Try to upload profile picture
          const storageRef = ref(storage, `profile-pictures/${user.uid}`);
          await uploadBytes(storageRef, profilePicture);
          profilePictureDownloadURL = await getDownloadURL(storageRef);
        } catch (uploadError) {
          // If upload fails, log error but continue onboarding without profile picture
          console.error('Profile picture upload failed:', uploadError);
          toast.warning('Could not upload profile picture due to network issues. You can add one later in your profile.');
          // Continue with onboarding process without the profile picture
        }
      }
      
      // Update user profile in Firestore
      await updateUserProfile(user.uid, {
        username,
        profilePicture: profilePictureDownloadURL,
        initialWeight: parseFloat(initialWeight),
        goals: {
          targetWeight: parseFloat(targetWeight),
          targetMiles: parseFloat(targetMiles),
          targetStreak: parseInt(targetStreak, 10)
        }
      });
      
      // Mark onboarding as complete
      await completeOnboarding(user.uid);
      
      toast.success('Profile setup complete!');
      
      // Add explicit redirection to dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Onboarding error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Step {currentStep + 1}: {STEPS[currentStep].replace('-', ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={STEPS[currentStep]} className="w-full">
          {/* Username Step */}
          <TabsContent value="username" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Choose a username
              </label>
              <Input
                id="username"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This is how you&apos;ll appear to others in the app
              </p>
            </div>
          </TabsContent>
          
          {/* Profile Picture Step */}
          <TabsContent value="profile-picture" className="space-y-4">
            <div className="space-y-4">
              <label className="text-sm font-medium">
                Upload a profile picture
              </label>
              
              {profilePictureURL && (
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    <img 
                      src={profilePictureURL} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePicture ? 'Change Picture' : 'Select Picture'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Goals Step */}
          <TabsContent value="goals" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="initialWeight" className="text-sm font-medium">
                  Current Weight (lbs)
                </label>
                <Input
                  id="initialWeight"
                  type="number"
                  placeholder="e.g., 150"
                  value={initialWeight}
                  onChange={(e) => setInitialWeight(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="targetWeight" className="text-sm font-medium">
                  Target Weight (lbs)
                </label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder="e.g., 140"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="targetMiles" className="text-sm font-medium">
                  Target Miles to Run at Once
                </label>
                <Input
                  id="targetMiles"
                  type="number"
                  placeholder="e.g., 3"
                  value={targetMiles}
                  onChange={(e) => setTargetMiles(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="targetStreak" className="text-sm font-medium">
                  Target Consecutive Days Eating Well
                </label>
                <Input
                  id="targetStreak"
                  type="number"
                  placeholder="e.g., 14"
                  value={targetStreak}
                  onChange={(e) => setTargetStreak(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Hidden TabsList for accessibility */}
          <TabsList className="hidden">
            {STEPS.map((step) => (
              <TabsTrigger key={step} value={step}>
                {step}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isLoading}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading 
            ? 'Processing...' 
            : currentStep === STEPS.length - 1 
              ? 'Complete' 
              : 'Next'
          }
        </Button>
      </CardFooter>
    </Card>
  );
} 