# Supabase Database Schema

## Profiles Table

Your Supabase `profiles` table should have these columns:

```sql
CREATE TABLE profiles (
    clerk_id TEXT PRIMARY KEY,        -- Clerk user ID (e.g., user_31yK29VRF1fXjDvXOe9yLCZr4IN)
    email TEXT NOT NULL,              -- User's email from Clerk
    full_name TEXT,                   -- User's name from Clerk
    avatar_url TEXT,                  -- Profile picture URL from Clerk
    birth_date TEXT,                  -- Birth date (MM/DD/YYYY format)
    birth_time TEXT,                  -- Birth time (HH:MM format)
    birth_location TEXT,              -- Birth location (City, Country)
    profile_completed BOOLEAN DEFAULT false, -- Whether onboarding is done
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

-- Policy to allow users to update only their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Policy to allow profile creation
CREATE POLICY "Users can create own profile" ON profiles
FOR INSERT WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Index for better performance
CREATE INDEX idx_profiles_clerk_id ON profiles(clerk_id);
```

## How Authentication Works

1. **Clerk Authentication**: Users sign up/in through Clerk
2. **Automatic Sync**: When authenticated, user data is automatically synced to Supabase
3. **Profile Completion**: Additional birth data is saved to Supabase during onboarding
4. **Data Persistence**: All profile data persists in Supabase for future use

## Environment Variables Required

Make sure these are set in your `.env` file:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```