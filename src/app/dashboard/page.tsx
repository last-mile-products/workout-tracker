'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import { 
  getUserProfile, 
  addWeightEntry, 
  addRunEntry, 
  addEatingWellEntry,
  calculateWeightProgress,
  calculateMilesProgress,
  calculateStreakProgress
} from '@/lib/firebase/firestore';
import { formatDate } from '@/lib/utils/date-utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weightProgress, setWeightProgress] = useState(0);
  const [milesProgress, setMilesProgress] = useState(0);
  const [streakProgress, setStreakProgress] = useState(0);
  const [username, setUsername] = useState('');
  
  // Form states
  const [currentWeight, setCurrentWeight] = useState('');
  const [runDistance, setRunDistance] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Load user data and progress
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user profile
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUsername(profile.username || '');
        }
        
        // Calculate progress for each goal
        const weight = await calculateWeightProgress(user.uid);
        const miles = await calculateMilesProgress(user.uid);
        const streak = await calculateStreakProgress(user.uid);
        
        setWeightProgress(weight);
        setMilesProgress(miles);
        setStreakProgress(streak);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load your progress data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);
  
  // Handle weight entry submission
  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!currentWeight) {
      toast.error('Please enter your current weight');
      return;
    }
    
    const weightValue = parseFloat(currentWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await addWeightEntry(user.uid, weightValue);
      
      // Recalculate weight progress
      const weight = await calculateWeightProgress(user.uid);
      setWeightProgress(weight);
      
      toast.success('Weight entry added successfully');
      setCurrentWeight('');
    } catch (error) {
      console.error('Error adding weight entry:', error);
      toast.error('Failed to add weight entry');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle run entry submission
  const handleRunSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!runDistance) {
      toast.error('Please enter your run distance');
      return;
    }
    
    const distanceValue = parseFloat(runDistance);
    if (isNaN(distanceValue) || distanceValue <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await addRunEntry(user.uid, distanceValue);
      
      // Recalculate miles progress
      const miles = await calculateMilesProgress(user.uid);
      setMilesProgress(miles);
      
      toast.success('Run entry added successfully');
      setRunDistance('');
    } catch (error) {
      console.error('Error adding run entry:', error);
      toast.error('Failed to add run entry');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle eating well entry
  const handleEatingWellSubmit = async () => {
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      await addEatingWellEntry(user.uid);
      
      // Recalculate streak progress
      const streak = await calculateStreakProgress(user.uid);
      setStreakProgress(streak);
      
      toast.success('Eating well entry added for today');
    } catch (error) {
      console.error('Error adding eating well entry:', error);
      toast.error('Failed to add eating well entry');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {username || 'there'}! Track your progress and log your activities.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <p>Loading your progress...</p>
          </div>
        ) : (
          <>
            {/* Progress Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Weight Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Weight Goal</CardTitle>
                  <CardDescription>
                    {weightProgress.toFixed(0)}% complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={weightProgress} className="h-2" />
                </CardContent>
              </Card>
              
              {/* Miles Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Running Goal</CardTitle>
                  <CardDescription>
                    {milesProgress.toFixed(0)}% complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={milesProgress} className="h-2" />
                </CardContent>
              </Card>
              
              {/* Eating Well Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Eating Well Goal</CardTitle>
                  <CardDescription>
                    {streakProgress.toFixed(0)}% complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={streakProgress} className="h-2" />
                </CardContent>
              </Card>
            </div>
            
            {/* Activity Logging */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Log Weight */}
              <Card>
                <CardHeader>
                  <CardTitle>Log Weight</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWeightSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="weight" className="text-sm font-medium">
                        Current Weight (lbs)
                      </label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="Enter weight"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Date
                      </label>
                      <Input
                        type="text"
                        value={formatDate(new Date())}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Weight is always logged for today
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={submitting}
                    >
                      Log Weight
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Log Run */}
              <Card>
                <CardHeader>
                  <CardTitle>Log Run</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRunSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="distance" className="text-sm font-medium">
                        Distance (miles)
                      </label>
                      <Input
                        id="distance"
                        type="number"
                        placeholder="Enter distance"
                        value={runDistance}
                        onChange={(e) => setRunDistance(e.target.value)}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Date
                      </label>
                      <Input
                        type="text"
                        value={formatDate(new Date())}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Run is always logged for today
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={submitting}
                    >
                      Log Run
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Log Eating Well */}
              <Card>
                <CardHeader>
                  <CardTitle>Log Eating Well</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Click the button below to mark today as a day you ate well.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This will count towards your streak of consecutive days eating well.
                  </p>
                  <Button 
                    onClick={handleEatingWellSubmit} 
                    className="w-full"
                    disabled={submitting}
                  >
                    I Ate Well Today
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
} 