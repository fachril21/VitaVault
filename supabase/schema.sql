-- ============================================
-- VitalVault Database Schema for Supabase
-- Run this script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MEDICAL RECORDS TABLE
-- Stores encrypted medical document metadata
-- ============================================
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Privy user ID (not Supabase auth)
  
  -- IPFS Storage
  ipfs_cid TEXT NOT NULL,
  original_filename TEXT,
  file_type TEXT CHECK (file_type IN ('lab_report', 'prescription', 'diagnosis', 'imaging', 'other')),
  
  -- Lit Protocol Encryption
  encrypted_symmetric_key TEXT NOT NULL,
  access_conditions JSONB NOT NULL DEFAULT '{}',
  
  -- Extracted Medical Data (Gemini AI output)
  extracted_data JSONB,
  
  -- Metadata
  document_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tags for search/filtering
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_tags ON medical_records USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_medical_records_not_deleted ON medical_records(deleted_at) 
  WHERE deleted_at IS NULL;

-- ============================================
-- SHARED ACCESS TABLE
-- For QR code sharing with expiration
-- ============================================
CREATE TABLE IF NOT EXISTS shared_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL, -- Privy user ID
  
  -- Access Control
  share_token TEXT NOT NULL UNIQUE,
  recipient_email TEXT,
  
  -- Permissions
  can_view BOOLEAN DEFAULT TRUE,
  can_download BOOLEAN DEFAULT FALSE,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  max_views INTEGER DEFAULT NULL,
  view_count INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Metadata
  access_reason TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_access_record_id ON shared_access(record_id);
CREATE INDEX IF NOT EXISTS idx_shared_access_share_token ON shared_access(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_access_expires_at ON shared_access(expires_at);
CREATE INDEX IF NOT EXISTS idx_shared_access_owner_id ON shared_access(owner_id);

-- ============================================
-- ACCESS LOGS TABLE
-- Audit trail for HIPAA/privacy compliance
-- ============================================
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  user_id TEXT, -- Privy user ID (null for anonymous/shared access)
  shared_access_id UUID REFERENCES shared_access(id) ON DELETE SET NULL,
  
  -- Event Details
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'share', 'revoke', 'delete')),
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_access_logs_record_id ON access_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_occurred_at ON access_logs(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for medical_records
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment share view count
CREATE OR REPLACE FUNCTION increment_share_view_count(token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE shared_access 
  SET 
    view_count = view_count + 1,
    last_accessed_at = NOW()
  WHERE share_token = token;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES FOR medical_records
-- Note: Using service role or custom JWT with user_id claim
-- For Privy, we pass user_id in requests
-- ============================================

-- Allow all operations for now (will use application-level auth with Privy)
-- In production, you'd validate Privy JWT tokens

CREATE POLICY "Allow all for medical_records" 
  ON medical_records 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for shared_access" 
  ON shared_access 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for access_logs" 
  ON access_logs 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- Uncomment to insert test data
-- ============================================

/*
INSERT INTO medical_records (
  user_id,
  ipfs_cid,
  original_filename,
  file_type,
  encrypted_symmetric_key,
  access_conditions,
  extracted_data,
  document_date,
  tags
) VALUES (
  'test-user-123',
  'QmTestCID123456789',
  'lab_results_2024.pdf',
  'lab_report',
  'encrypted_key_placeholder',
  '{"chain": "ethereum", "accessControlConditions": []}',
  '{"patient_name": "John Doe", "tests": [{"name": "Blood Glucose", "result": "95 mg/dL"}]}',
  '2024-01-15',
  ARRAY['blood test', 'glucose']
);
*/

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify setup
-- ============================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('medical_records', 'shared_access', 'access_logs');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Success message
SELECT 'VitalVault database setup complete!' AS status;
