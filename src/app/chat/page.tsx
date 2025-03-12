'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/firebase/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { addChatMessage, getChatMessages, ChatMessage } from '@/lib/firebase/firestore';
import { formatDate } from '@/lib/utils/date-utils';

export default function ChatPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load chat messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const chatMessages = await getChatMessages(50);
        
        // Sort by timestamp ascending (oldest first)
        const sortedMessages = [...chatMessages].sort((a, b) => {
          const timestampA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
          const timestampB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
          return timestampA.getTime() - timestampB.getTime();
        });
        
        setMessages(sortedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load chat messages');
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Set up real-time updates in the future
    // For now, we'll just reload messages every 30 seconds
    const intervalId = setInterval(loadMessages, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setSending(true);
    
    try {
      await addChatMessage(user.uid, message.trim());
      
      // Reload messages
      const chatMessages = await getChatMessages(50);
      const sortedMessages = [...chatMessages].sort((a, b) => {
        const timestampA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
        const timestampB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
        return timestampA.getTime() - timestampB.getTime();
      });
      
      setMessages(sortedMessages);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  
  // Format timestamp
  const formatMessageTime = (timestamp: Date | { toDate: () => Date }) => {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const today = new Date();
    
    // If same day, just show time
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date and time
    return `${formatDate(date)} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Get initials for avatar fallback
  const getInitials = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground">
            Chat with your family and share your progress
          </p>
        </div>
        
        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle>Family Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <p>No messages yet. Be the first to say hello!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isCurrentUser = user?.uid === msg.userId;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="h-8 w-8 mt-1">
                        {msg.profilePicture ? (
                          <AvatarImage src={msg.profilePicture} alt={msg.username} />
                        ) : null}
                        <AvatarFallback>{getInitials(msg.username || '')}</AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        <div className="flex gap-2 items-center mb-1">
                          <span className="text-sm font-medium">{msg.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                        </div>
                        <div 
                          className={`py-2 px-3 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending || !user}
              />
              <Button type="submit" disabled={sending || !user}>
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 