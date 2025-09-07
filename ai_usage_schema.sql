-- AI Usage Tracking Table Schema
-- This table tracks all AI API calls for subscription management and cost analytics

CREATE TABLE IF NOT EXISTS ai_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('numerology', 'loveMatch', 'trustAssessment', 'dailyInsights', 'oracle', 'celebrityMatch')),
  ai_provider TEXT NOT NULL CHECK (ai_provider IN ('openai', 'gemini')),
  estimated_cost DECIMAL(10, 6) DEFAULT 0.12,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON ai_usage(user_id, DATE_TRUNC('month', created_at));
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature_type ON ai_usage(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider ON ai_usage(ai_provider);

-- Add RLS (Row Level Security) policies if using Supabase
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own usage data
CREATE POLICY "Users can view own AI usage" ON ai_usage
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Service can insert usage data
CREATE POLICY "Service can insert AI usage" ON ai_usage
  FOR INSERT WITH CHECK (true);

-- Update the subscriptions table to support unlimited tier
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'unlimited'));

-- Update existing premium subscriptions
UPDATE subscriptions SET subscription_type = 'premium' WHERE subscription_type IS NULL AND status = 'active';

-- Add cost tracking fields to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS monthly_cost_limit DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_month_cost DECIMAL(10, 2) DEFAULT 0.00;

-- Create a view for monthly usage statistics
CREATE OR REPLACE VIEW monthly_ai_usage AS
SELECT 
  user_id,
  DATE_TRUNC('month', created_at) as usage_month,
  COUNT(*) as total_requests,
  SUM(estimated_cost) as total_cost,
  AVG(estimated_cost) as avg_cost_per_request,
  SUM(CASE WHEN ai_provider = 'openai' THEN 1 ELSE 0 END) as openai_requests,
  SUM(CASE WHEN ai_provider = 'gemini' THEN 1 ELSE 0 END) as gemini_requests,
  SUM(prompt_tokens) as total_prompt_tokens,
  SUM(completion_tokens) as total_completion_tokens,
  SUM(total_tokens) as total_tokens
FROM ai_usage 
GROUP BY user_id, DATE_TRUNC('month', created_at)
ORDER BY usage_month DESC, user_id;

-- Create a function to get usage for a user (lifetime for free, monthly for premium/unlimited)
CREATE OR REPLACE FUNCTION get_user_ai_usage(user_uuid TEXT, subscription_tier TEXT DEFAULT 'free')
RETURNS TABLE (
  total_requests BIGINT,
  total_cost NUMERIC,
  openai_requests BIGINT,
  gemini_requests BIGINT,
  remaining_free_requests INTEGER,
  remaining_premium_requests INTEGER
) AS $$
DECLARE
  current_month_start TIMESTAMPTZ;
  current_usage RECORD;
  free_limit INTEGER := 5; -- 5 lifetime requests for free users
  premium_limit INTEGER := 50; -- 50 monthly requests for premium users
BEGIN
  current_month_start := DATE_TRUNC('month', NOW());
  
  -- For free users: get all-time usage. For premium/unlimited: get monthly usage
  IF subscription_tier = 'free' THEN
    SELECT 
      COUNT(*) as requests,
      COALESCE(SUM(estimated_cost), 0) as cost,
      SUM(CASE WHEN ai_provider = 'openai' THEN 1 ELSE 0 END) as openai_reqs,
      SUM(CASE WHEN ai_provider = 'gemini' THEN 1 ELSE 0 END) as gemini_reqs
    INTO current_usage
    FROM ai_usage 
    WHERE user_id = user_uuid;
  ELSE
    SELECT 
      COUNT(*) as requests,
      COALESCE(SUM(estimated_cost), 0) as cost,
      SUM(CASE WHEN ai_provider = 'openai' THEN 1 ELSE 0 END) as openai_reqs,
      SUM(CASE WHEN ai_provider = 'gemini' THEN 1 ELSE 0 END) as gemini_reqs
    INTO current_usage
    FROM ai_usage 
    WHERE user_id = user_uuid 
      AND created_at >= current_month_start;
  END IF;
  
  RETURN QUERY SELECT 
    COALESCE(current_usage.requests, 0),
    COALESCE(current_usage.cost, 0),
    COALESCE(current_usage.openai_reqs, 0),
    COALESCE(current_usage.gemini_reqs, 0),
    GREATEST(0, free_limit - COALESCE(current_usage.requests, 0)::INTEGER),
    GREATEST(0, premium_limit - COALESCE(current_usage.requests, 0)::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_ai_usage TO authenticated;