'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getAllUsers, calculateWeightProgress, calculateMilesProgress, calculateStreakProgress } from '@/lib/firebase/firestore';
import { DocumentData } from 'firebase/firestore';

interface UserProgress {
  id: string;
  username: string;
  profilePicture: string;
  weightProgress: number;
  milesProgress: number;
  streakProgress: number;
  currentStreak: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProgress[]>([]);
  
  // Load all users and their progress
  useEffect(() => {
    const fetchUsersProgress = async () => {
      try {
        setLoading(true);
        
        // Get all users
        const allUsers = await getAllUsers();
        
        // Filter out users who haven't completed onboarding
        const onboardedUsers = allUsers.filter(u => u.onboarded);
        
        // Calculate progress for each user
        const progressPromises = onboardedUsers.map(async (userData: DocumentData) => {
          const userId = userData.id;
          
          try {
            const weightProgress = await calculateWeightProgress(userId);
            const milesProgress = await calculateMilesProgress(userId);
            const streakResult = await calculateStreakProgress(userId);
            const streakProgress = streakResult;
            
            // Calculate current streak
            // This would come from the streak progress calculation
            // For now, we're using a simple calculation based on the progress and target
            const targetStreak = userData.goals?.targetStreak || 1;
            const currentStreak = Math.floor((streakProgress / 100) * targetStreak);
            
            return {
              id: userId,
              username: userData.username || 'Anonymous',
              profilePicture: userData.profilePicture || '',
              weightProgress,
              milesProgress,
              streakProgress,
              currentStreak
            };
          } catch (error) {
            console.error(`Error calculating progress for user ${userId}:`, error);
            return {
              id: userId,
              username: userData.username || 'Anonymous',
              profilePicture: userData.profilePicture || '',
              weightProgress: 0,
              milesProgress: 0,
              streakProgress: 0,
              currentStreak: 0
            };
          }
        });
        
        const progressResults = await Promise.all(progressPromises);
        setUsers(progressResults);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        toast.error('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsersProgress();
  }, []);
  
  // Sort users by progress (descending)
  const sortedByWeight = [...users].sort((a, b) => b.weightProgress - a.weightProgress);
  const sortedByMiles = [...users].sort((a, b) => b.milesProgress - a.milesProgress);
  const sortedByStreak = [...users].sort((a, b) => b.streakProgress - a.streakProgress);
  
  // Get top streaks for kudos section
  const topStreaks = [...users]
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .filter(u => u.currentStreak > 0)
    .slice(0, 3);
  
  // Get initials for avatar fallback
  const getInitials = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };
  
  // Determine if a user is the current user
  const isCurrentUser = (userId: string) => {
    return user?.uid === userId;
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how everyone is progressing towards their fitness goals
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <p>Loading leaderboard data...</p>
          </div>
        ) : (
          <>
            {/* Kudos Section */}
            <Card>
              <CardHeader>
                <CardTitle>Kudos!</CardTitle>
                <CardDescription>
                  Top performers with the longest eating well streaks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topStreaks.length === 0 ? (
                  <p className="text-muted-foreground">
                    No active streaks yet. Start eating well to be featured here!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-4 md:gap-8">
                    {topStreaks.map((userStreaks, index) => (
                      <div 
                        key={userStreaks.id} 
                        className={`flex flex-col items-center ${
                          isCurrentUser(userStreaks.id) ? 'text-primary font-medium' : ''
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            {userStreaks.profilePicture ? (
                              <AvatarImage src={userStreaks.profilePicture} alt={userStreaks.username} />
                            ) : null}
                            <AvatarFallback className="text-xl">{getInitials(userStreaks.username)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <p className="mt-2 font-medium">{userStreaks.username}</p>
                        <p className="text-sm">
                          <span className="font-bold">{userStreaks.currentStreak}</span> day streak
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Progress Tables */}
            <Tabs defaultValue="weight">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weight">Weight Goals</TabsTrigger>
                <TabsTrigger value="miles">Running Goals</TabsTrigger>
                <TabsTrigger value="streak">Eating Well Goals</TabsTrigger>
              </TabsList>
              
              {/* Weight Progress Table */}
              <TabsContent value="weight">
                <Card>
                  <CardHeader>
                    <CardTitle>Weight Goal Progress</CardTitle>
                    <CardDescription>
                      Everyone&apos;s progress towards their target weight
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead className="text-right">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedByWeight.map((userData, index) => (
                          <TableRow 
                            key={userData.id}
                            className={isCurrentUser(userData.id) ? 'bg-muted' : ''}
                          >
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {userData.profilePicture ? (
                                    <AvatarImage src={userData.profilePicture} alt={userData.username} />
                                  ) : null}
                                  <AvatarFallback>{getInitials(userData.username)}</AvatarFallback>
                                </Avatar>
                                <span>{userData.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {userData.weightProgress.toFixed(0)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Miles Progress Table */}
              <TabsContent value="miles">
                <Card>
                  <CardHeader>
                    <CardTitle>Running Goal Progress</CardTitle>
                    <CardDescription>
                      Everyone&apos;s progress towards their target miles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead className="text-right">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedByMiles.map((userData, index) => (
                          <TableRow 
                            key={userData.id}
                            className={isCurrentUser(userData.id) ? 'bg-muted' : ''}
                          >
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {userData.profilePicture ? (
                                    <AvatarImage src={userData.profilePicture} alt={userData.username} />
                                  ) : null}
                                  <AvatarFallback>{getInitials(userData.username)}</AvatarFallback>
                                </Avatar>
                                <span>{userData.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {userData.milesProgress.toFixed(0)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Streak Progress Table */}
              <TabsContent value="streak">
                <Card>
                  <CardHeader>
                    <CardTitle>Eating Well Goal Progress</CardTitle>
                    <CardDescription>
                      Everyone&apos;s progress towards their target eating well streak
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead className="text-right">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedByStreak.map((userData, index) => (
                          <TableRow 
                            key={userData.id}
                            className={isCurrentUser(userData.id) ? 'bg-muted' : ''}
                          >
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {userData.profilePicture ? (
                                    <AvatarImage src={userData.profilePicture} alt={userData.username} />
                                  ) : null}
                                  <AvatarFallback>{getInitials(userData.username)}</AvatarFallback>
                                </Avatar>
                                <span>{userData.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {userData.streakProgress.toFixed(0)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </MainLayout>
  );
} 