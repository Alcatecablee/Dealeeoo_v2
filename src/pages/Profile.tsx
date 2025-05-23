import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animation-utils';

interface ProfileFormData {
  full_name: string;
  avatar_url: string;
}

interface NotificationPreference {
  id: string;
  type: string;
  enabled: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, updateProfile, signOut } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormData>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Notification types
  const notificationTypes = [
    { type: 'deal_status', label: 'Deal Status Changes' },
    { type: 'new_message', label: 'New Chat Messages' },
    { type: 'dispute', label: 'Disputes' },
    { type: 'resolution', label: 'Dispute Resolutions' },
  ];

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      // Set form default values
      setValue('full_name', user.full_name || '');
      setValue('avatar_url', user.avatar_url || '');
      
      // Fetch notification preferences
      fetchNotificationPreferences();
    }
  }, [user, setValue]);

  const fetchNotificationPreferences = async () => {
    if (!user) return;
    
    setIsLoadingPreferences(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_email', user.email);

      if (error) throw error;

      // If preferences exist, use them, otherwise create defaults
      if (data && data.length > 0) {
        setNotificationPreferences(data);
      } else {
        // Create default preferences (all enabled)
        const defaultPrefs = await Promise.all(notificationTypes.map(async ({ type }) => {
          const { data: newPref, error: insertError } = await supabase
            .from('notification_preferences')
            .insert({
              user_email: user.email,
              type,
              enabled: true
            })
            .select('*')
            .single();

          if (insertError) throw insertError;
          return newPref;
        }));

        setNotificationPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateProfile({
        full_name: data.full_name,
        avatar_url: data.avatar_url
      });
      
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotification = async (id: string, newEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ enabled: newEnabled })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotificationPreferences(prev => 
        prev.map(pref => pref.id === id ? { ...pref, enabled: newEnabled } : pref)
      );
    } catch (error) {
      console.error('Error updating notification preference:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-friendly-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
      <Header />
      <motion.div {...fadeInUp} className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent">
          My Profile
        </h1>

        <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-friendly-blue/30 dark:border-friendly-blue/60 rounded-xl shadow-lg">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    {error}
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="mb-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-300 dark:border-green-800">
                    {successMessage}
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Cannot be changed)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Profile Picture URL</Label>
                  <Input
                    id="avatar_url"
                    {...register('avatar_url')}
                    placeholder="Enter URL to your profile picture"
                  />
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Sign Out
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="bg-gradient-friendly hover:opacity-90 transition-opacity"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-friendly-blue/30 dark:border-friendly-blue/60 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
              
              {isLoadingPreferences ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-friendly-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading your preferences...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {notificationTypes.map(({ type, label }) => {
                    const preference = notificationPreferences.find(p => p.type === type);
                    return preference ? (
                      <div key={type} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{label}</h3>
                          <p className="text-sm text-muted-foreground">Receive notifications for {label.toLowerCase()}</p>
                        </div>
                        <Switch
                          checked={preference.enabled}
                          onCheckedChange={(checked) => handleToggleNotification(preference.id, checked)}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Profile;