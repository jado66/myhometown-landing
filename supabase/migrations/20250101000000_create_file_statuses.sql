-- Create file_statuses table for managing file visibility
-- Status can be 'locked' or 'hidden'
-- Unlocking a file removes it from the table entirely
CREATE TABLE IF NOT EXISTS file_statuses (
  file_key TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('locked', 'hidden'))
);

-- Create index for faster status lookups
CREATE INDEX IF NOT EXISTS idx_file_statuses_status ON file_statuses(status);

-- Enable Row Level Security
ALTER TABLE file_statuses ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to view all file statuses
CREATE POLICY "Allow authenticated users to view file statuses"
  ON file_statuses
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert file statuses
CREATE POLICY "Allow authenticated users to lock files"
  ON file_statuses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update file statuses
CREATE POLICY "Allow authenticated users to update file statuses"
  ON file_statuses
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete file statuses (unlock)
CREATE POLICY "Allow authenticated users to delete file statuses"
  ON file_statuses
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comments
COMMENT ON TABLE file_statuses IS 'Stores status information for S3 files (locked or hidden)';
COMMENT ON COLUMN file_statuses.file_key IS 'S3 object key (full path) - Primary key';
COMMENT ON COLUMN file_statuses.status IS 'File status: locked or hidden';
