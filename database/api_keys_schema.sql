-- API Keys table for managing API access
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 hash of the API key
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions TEXT[] DEFAULT ARRAY['read', 'write'],
    last_used TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Indexes for performance
    CONSTRAINT api_keys_key_hash_unique UNIQUE (key_hash),
    CONSTRAINT api_keys_name_not_empty CHECK (name != ''),
    CONSTRAINT api_keys_permissions_not_empty CHECK (array_length(permissions, 1) > 0)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- Function to update last_used and usage_count
CREATE OR REPLACE FUNCTION update_api_key_usage(api_key_hash VARCHAR(64))
RETURNS VOID AS $$
BEGIN
    UPDATE api_keys 
    SET last_used = NOW(), 
        usage_count = usage_count + 1
    WHERE key_hash = api_key_hash;
END;
$$ LANGUAGE plpgsql;

-- Function to check if API key is valid
CREATE OR REPLACE FUNCTION is_api_key_valid(api_key_hash VARCHAR(64))
RETURNS BOOLEAN AS $$
DECLARE
    key_record RECORD;
BEGIN
    SELECT * INTO key_record 
    FROM api_keys 
    WHERE key_hash = api_key_hash;
    
    -- Return false if key doesn't exist
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Return false if key is inactive
    IF NOT key_record.is_active THEN
        RETURN false;
    END IF;
    
    -- Return false if key is expired
    IF key_record.expires_at IS NOT NULL AND key_record.expires_at < NOW() THEN
        RETURN false;
    END IF;
    
    -- Update usage statistics
    PERFORM update_api_key_usage(api_key_hash);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get API key permissions
CREATE OR REPLACE FUNCTION get_api_key_permissions(api_key_hash VARCHAR(64))
RETURNS TEXT[] AS $$
DECLARE
    key_permissions TEXT[];
BEGIN
    SELECT permissions INTO key_permissions
    FROM api_keys 
    WHERE key_hash = api_key_hash 
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > NOW());
    
    RETURN COALESCE(key_permissions, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = created_by);

-- Policy: Users can only create API keys for themselves
CREATE POLICY "Users can create own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Users can only update their own API keys
CREATE POLICY "Users can update own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Users can only delete their own API keys
CREATE POLICY "Users can delete own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = created_by);

-- Admin policy: Admins can see all API keys (commented out until role column is added)
-- CREATE POLICY "Admins can view all API keys" ON api_keys
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'admin'
--         )
--     );

-- Admin policy: Admins can manage all API keys (commented out until role column is added)
-- CREATE POLICY "Admins can manage all API keys" ON api_keys
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'admin'
--         )
--     );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
-- Note: No sequence grant needed since we use UUID for primary key

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION update_api_key_usage(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION is_api_key_valid(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_api_key_permissions(VARCHAR) TO authenticated;

-- Insert sample API key for testing (optional)
-- Note: This is just for demonstration, in production you'd generate these through the application
-- INSERT INTO api_keys (key_hash, name, description, created_by, permissions) 
-- VALUES (
--     'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- hash of 'test-key'
--     'Test API Key',
--     'Sample API key for testing purposes',
--     '80bfa7fb-46fb-43b8-8434-0d087ef0098e', -- replace with actual user ID
--     ARRAY['read', 'write']
-- ); 