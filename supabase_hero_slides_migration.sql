-- Hero Slides Table for Homepage Slider
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS hero_slides (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  title_color TEXT DEFAULT 'text-white',
  button_type TEXT DEFAULT 'pink',
  button_title TEXT,
  button_link TEXT,
  button_icon TEXT DEFAULT 'TbArrowRight',
  bg_image TEXT,
  bg_image_alt TEXT,
  bg_overlay_color TEXT DEFAULT 'bg-[var(--black)]',
  bg_overlay_opacity TEXT DEFAULT 'opacity-10',
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published slides
CREATE POLICY "Anyone can view published slides"
  ON hero_slides
  FOR SELECT
  USING (published = true);

-- Policy: Authenticated users can manage all slides (for admin)
CREATE POLICY "Authenticated users can manage slides"
  ON hero_slides
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index for ordering
CREATE INDEX idx_hero_slides_order ON hero_slides(display_order);

-- Create index for published status
CREATE INDEX idx_hero_slides_published ON hero_slides(published);
