'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useAuth } from '@/lib/firebase/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getUserProfile, updateUserProfile } from '@/lib/firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/firebase';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileFormData {
  username: string;
  initialWeight: number;
  goals: {
    targetWeight: number;
    targetMiles: number;
    targetStreak: number;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePictureURL, setProfilePictureURL] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    initialWeight: 0,
    goals: {
      targetWeight: 0,
      targetMiles: 0,
      targetStreak: 0
    }
  });

  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const profile = await getUserProfile(user.uid);

        if (profile) {
          setFormData({
            username: profile.username || '',
            initialWeight: profile.initialWeight || 0,
            goals: {
              targetWeight: profile.goals?.targetWeight || 0,
              targetMiles: profile.goals?.targetMiles || 0,
              targetStreak: profile.goals?.targetStreak || 0
            }
          });

          if (profile.profilePicture) {
            setProfilePictureURL(profile.profilePicture);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ProfileFormData | 'targetWeight' | 'targetMiles' | 'targetStreak'
  ) => {
    const { value } = e.target;
    
    if (field === 'username') {
      setFormData(prev => ({ ...prev, username: value }));
    } else if (field === 'initialWeight') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, initialWeight: numValue }));
    } else {
      // Handle goals fields
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        goals: {
          ...prev.goals,
          [field]: numValue
        }
      }));
    }
  };

  // Handle profile picture change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create a temporary preview URL
      const url = URL.createObjectURL(file);
      setProfilePictureURL(url);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Basic validation
    if (!formData.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    
    setSaving(true);
    
    try {
      // Upload new profile picture if selected
      let pictureURL = profilePictureURL;
      
      if (profilePicture) {
        try {
          // Try to upload the profile picture
          const storageRef = ref(storage, `profile-pictures/${user.uid}`);
          await uploadBytes(storageRef, profilePicture);
          pictureURL = await getDownloadURL(storageRef);
        } catch (uploadError) {
          // If upload fails due to CORS or other issues, keep the existing picture URL
          console.error('Profile picture upload failed:', uploadError);
          toast.warning('Could not upload profile picture due to network issues. Please try again later or contact support.');
          // Continue with profile update without changing the profile picture
        }
      }
      
      // Update profile in Firestore
      await updateUserProfile(user.uid, {
        username: formData.username,
        profilePicture: pictureURL,
        initialWeight: formData.initialWeight,
        goals: {
          targetWeight: formData.goals.targetWeight,
          targetMiles: formData.goals.targetMiles,
          targetStreak: formData.goals.targetStreak
        }
      });
      
      toast.success('Profile updated successfully');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfilePicture(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    return formData.username ? formData.username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            View and update your profile information and goals
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <p>Loading profile data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  {profilePictureURL ? (
                    <AvatarImage src={profilePictureURL} alt={formData.username} />
                  ) : null}
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
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
                  Change Picture
                </Button>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange(e, 'username')}
                    placeholder="Your username"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="initialWeight" className="text-sm font-medium">
                    Initial Weight (lbs)
                  </label>
                  <Input
                    id="initialWeight"
                    type="number"
                    value={formData.initialWeight || ''}
                    onChange={(e) => handleInputChange(e, 'initialWeight')}
                    placeholder="Initial weight in pounds"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your starting weight for calculating progress
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fitness Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Fitness Goals</CardTitle>
                <CardDescription>Update your fitness targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="targetWeight" className="text-sm font-medium">
                    Target Weight (lbs)
                  </label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={formData.goals.targetWeight || ''}
                    onChange={(e) => handleInputChange(e, 'targetWeight')}
                    placeholder="Target weight in pounds"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="targetMiles" className="text-sm font-medium">
                    Target Miles to Run at Once
                  </label>
                  <Input
                    id="targetMiles"
                    type="number"
                    value={formData.goals.targetMiles || ''}
                    onChange={(e) => handleInputChange(e, 'targetMiles')}
                    placeholder="Target miles"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="targetStreak" className="text-sm font-medium">
                    Target Consecutive Days Eating Well
                  </label>
                  <Input
                    id="targetStreak"
                    type="number"
                    value={formData.goals.targetStreak || ''}
                    onChange={(e) => handleInputChange(e, 'targetStreak')}
                    placeholder="Target streak days"
                    min="1"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="ml-auto" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </MainLayout>
  );
} 