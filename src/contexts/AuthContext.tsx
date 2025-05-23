import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  migrateGuestDeals: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error.message);
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user data:', userError.message);
          setIsLoading(false);
          return;
        }

        if (userData.user) {
          setUser({
            id: userData.user.id,
            email: userData.user.email!,
          });
          setIsAuthenticated(true);

          // Get profile data if it exists
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userData.user.id)
            .single();

          if (profileData) {
            setUser(prev => ({
              ...prev!,
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url,
            }));
          }
        }
      }
      
      setIsLoading(false);
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData.user) {
            setUser({
              id: userData.user.id,
              email: userData.user.email!,
            });
            setIsAuthenticated(true);

            // Get profile data
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', userData.user.id)
              .single();

            if (profileData) {
              setUser(prev => ({
                ...prev!,
                full_name: profileData.full_name,
                avatar_url: profileData.avatar_url,
              }));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    
    if (response.error) {
      toast.error(response.error.message);
    } else if (response.data?.user) {
      // Create a profile entry
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: response.data.user.id,
        email: email,
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Migrate guest deals if any
      migrateGuestDeals();
      
      toast.success('Account created successfully! Please check your email to verify your account.');
    }
    
    setIsLoading(false);
    return response;
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      toast.error(response.error.message);
    } else {
      toast.success('Signed in successfully!');
      // Migrate guest deals if any after signing in
      migrateGuestDeals();
    }
    
    setIsLoading(false);
    return response;
  };

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Signed out successfully!');
    }
    
    setIsLoading(false);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    setIsLoading(true);
    
    // Update profile table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast.error('Error updating profile');
      console.error('Error updating profile:', error);
    } else {
      setUser((prev) => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated successfully!');
    }
    
    setIsLoading(false);
  };

  const migrateGuestDeals = async () => {
    if (!user) return;
    
    const guestId = localStorage.getItem('guestId');
    if (!guestId) return;

    try {
      // Call the RPC function to migrate deals
      const { error } = await supabase.rpc('migrate_guest_deals_to_user', { 
        p_guest_id: guestId,
        p_user_id: user.id 
      });

      if (error) {
        console.error('Error migrating guest deals:', error);
        return;
      }

      // Clear the guest ID as it's no longer needed
      localStorage.removeItem('guestId');
      toast.success('Your previous deals have been added to your account');
    } catch (error) {
      console.error('Error in migrateGuestDeals:', error);
    }
  };

  const value = {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated,
    migrateGuestDeals,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
