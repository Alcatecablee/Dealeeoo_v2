-- Create a dedicated users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create profiles table for optional user details
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add guest_id and creator_user_id columns to deals table
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS guest_id VARCHAR(255);
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS creator_user_id UUID REFERENCES public.users(id);

-- Create saved deal templates table
CREATE TABLE IF NOT EXISTS public.deal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  default_amount NUMERIC(12, 2),
  default_currency VARCHAR(10),
  default_expiry_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create API tokens table for users
CREATE TABLE IF NOT EXISTS public.api_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, name)
);

-- Add RLS policies for the new tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own profile
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can only update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Profiles are viewable by users who created them" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Deal templates policies
CREATE POLICY "Templates are viewable by users who created them" ON public.deal_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON public.deal_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.deal_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.deal_templates
  FOR DELETE USING (auth.uid() = user_id);

-- API tokens policies
CREATE POLICY "API tokens are viewable by users who created them" ON public.api_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API tokens" ON public.api_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API tokens" ON public.api_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API tokens" ON public.api_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to migrate guest deals to a user account
CREATE OR REPLACE FUNCTION public.migrate_guest_deals_to_user(p_guest_id TEXT, p_user_id UUID) 
RETURNS void AS $$
BEGIN
  UPDATE public.deals
  SET creator_user_id = p_user_id, guest_id = NULL
  WHERE guest_id = p_guest_id;
  
  -- Could also update deal_participants, but that's optional
  -- as the email would already match
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
