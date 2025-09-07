-- Complete Supabase SQL Schema for LoveLock App
-- This creates the profiles table with all necessary fields to accommodate Clerk authentication

-- Drop existing table if it exists (CAUTION: This will delete all data)
DROP TABLE IF EXISTS profiles;

-- Create profiles table with correct data types
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL UNIQUE, -- Clerk user ID (e.g., 'user_31yK29VRF1fXjDvXOe9yLCZr4IN')
    email VARCHAR NOT NULL,
    full_name VARCHAR NOT NULL,
    birth_date DATE,
    birth_time TIME,
    birth_location VARCHAR,
    wants_premium BOOLEAN DEFAULT false,
    wants_notifications BOOLEAN DEFAULT true,
    agreed_to_terms BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own data
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Optional: Create additional tables for extended functionality

-- Love match history table
CREATE TABLE love_matches (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    partner_name VARCHAR NOT NULL,
    partner_birth_date DATE,
    compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    match_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Numerology readings history table
CREATE TABLE numerology_readings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    reading_type VARCHAR NOT NULL, -- 'life_path', 'destiny', 'personality', etc.
    reading_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust assessments table
CREATE TABLE trust_assessments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    assessment_data JSONB,
    trust_score INTEGER CHECK (trust_score >= 0 AND trust_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription/premium status table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    subscription_type VARCHAR NOT NULL, -- 'free', 'premium', 'lifetime'
    status VARCHAR NOT NULL, -- 'active', 'cancelled', 'expired'
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for additional tables
CREATE INDEX idx_love_matches_user_id ON love_matches(user_id);
CREATE INDEX idx_numerology_readings_user_id ON numerology_readings(user_id);
CREATE INDEX idx_trust_assessments_user_id ON trust_assessments(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Enable RLS for additional tables
ALTER TABLE love_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerology_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for additional tables
CREATE POLICY "Users can view own love matches" ON love_matches
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own love matches" ON love_matches
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own numerology readings" ON numerology_readings
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own numerology readings" ON numerology_readings
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own trust assessments" ON trust_assessments
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own trust assessments" ON trust_assessments
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profiles synchronized from Clerk authentication';
COMMENT ON COLUMN profiles.user_id IS 'Clerk user ID - must be VARCHAR to accommodate Clerk string IDs';
COMMENT ON COLUMN profiles.birth_date IS 'User birth date for numerology calculations';
COMMENT ON COLUMN profiles.birth_time IS 'User birth time for detailed numerology/astrology readings';
COMMENT ON COLUMN profiles.birth_location IS 'User birth location for astrology calculations';