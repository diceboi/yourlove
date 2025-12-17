-- Announcements Table for Top Banner/Marquee
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  link_url TEXT,
  bg_color TEXT DEFAULT 'var(--black)',
  text_color TEXT DEFAULT 'white',
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published announcements
CREATE POLICY "Anyone can view published announcements"
  ON announcements
  FOR SELECT
  USING (published = true);

-- Policy: Authenticated users can manage all announcements (for admin)
CREATE POLICY "Authenticated users can manage announcements"
  ON announcements
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index for ordering
CREATE INDEX idx_announcements_order ON announcements(display_order);

-- Create index for published status
CREATE INDEX idx_announcements_published ON announcements(published);
