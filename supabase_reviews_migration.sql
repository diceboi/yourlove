-- Termék értékelési rendszer database schema
-- Futtatás: Supabase SQL Editor

-- 1. product_reviews tábla létrehozása
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Értékelés adatok
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  review_text TEXT NOT NULL,
  
  -- Moderálás
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  moderated_by UUID REFERENCES user_profiles(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Vásárló info (ha nincs user_id)
  reviewer_name VARCHAR(100),
  reviewer_email VARCHAR(255),
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: vagy user_id vagy reviewer_name kell
  CONSTRAINT review_has_user_or_name CHECK (
    user_id IS NOT NULL OR reviewer_name IS NOT NULL
  )
);

-- 2. Indexek teljesítményhez
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_created ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(product_id, rating);

-- 3. products tábla frissítése - statisztikák
ALTER TABLE products
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS idx_products_rating ON products(average_rating DESC);

-- 4. Trigger az updated_at automatikus frissítésére
CREATE OR REPLACE FUNCTION update_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_timestamp
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_review_updated_at();

-- 5. Function a termék rating statisztikák frissítésére
CREATE OR REPLACE FUNCTION update_product_review_stats(p_product_id UUID)
RETURNS void AS $$
DECLARE
  v_count INTEGER;
  v_avg DECIMAL(3,2);
BEGIN
  -- Csak jóváhagyott vélemények számítanak
  SELECT 
    COUNT(*),
    ROUND(AVG(rating)::numeric, 2)
  INTO v_count, v_avg
  FROM product_reviews
  WHERE product_id = p_product_id
    AND is_approved = true;
  
  -- Frissítés
  UPDATE products
  SET 
    review_count = COALESCE(v_count, 0),
    average_rating = COALESCE(v_avg, 0.0)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger a rating statisztikák automatikus frissítésére
CREATE OR REPLACE FUNCTION trigger_update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Új vélemény jóváhagyása vagy törlése esetén
  IF (TG_OP = 'INSERT' AND NEW.is_approved = true) OR
     (TG_OP = 'UPDATE' AND OLD.is_approved != NEW.is_approved) OR
     (TG_OP = 'DELETE' AND OLD.is_approved = true) THEN
    
    PERFORM update_product_review_stats(
      COALESCE(NEW.product_id, OLD.product_id)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_review_stats
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_update_product_stats();

-- 7. RLS (Row Level Security) - opcionális, ha szükséges
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Publikus olvasás jóváhagyott véleményekhez
CREATE POLICY "Anyone can view approved reviews"
ON product_reviews FOR SELECT
USING (is_approved = true);

-- Saját vélemények olvasása
CREATE POLICY "Users can view own reviews"
ON product_reviews FOR SELECT
USING (auth.uid() = user_id);

-- Vélemény írása bejelentkezett felhasználóknak
CREATE POLICY "Users can create reviews"
ON product_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Saját vélemény szerkesztése (csak ha még nem jóváhagyott)
CREATE POLICY "Users can update own pending reviews"
ON product_reviews FOR UPDATE
USING (auth.uid() = user_id AND is_approved = false)
WITH CHECK (auth.uid() = user_id);

-- 8. Kommentek
COMMENT ON TABLE product_reviews IS 'Termék értékelések és vélemények';
COMMENT ON COLUMN product_reviews.is_verified_purchase IS 'Ellenőrzött vásárlás (rendelésből származik)';
COMMENT ON COLUMN product_reviews.is_featured IS 'Kiemelt vélemény (admin által)';
COMMENT ON FUNCTION update_product_review_stats IS 'Termék átlagos értékelés és darabszám frissítése';
