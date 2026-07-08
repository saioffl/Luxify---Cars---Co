/*
# Car Showcase Schema

## Overview
Creates all tables for a luxury car showcase dashboard application.
This is a single-tenant app (no auth required).

## Tables

### cars
Stores the main car catalog with specifications, pricing, and metadata.
- id: UUID primary key
- make: Car manufacturer (e.g. Lamborghini)
- model: Model name (e.g. Huracán)
- year: Model year
- price: MSRP in USD
- category: coupe, sedan, suv, convertible, hypercar
- color: Primary exterior color
- color_hex: Hex code for the color
- horsepower, torque, top_speed_mph, acceleration_0_60
- engine: Engine descriptor string
- transmission: Auto/Manual/DCT
- drivetrain: RWD/AWD/FWD
- fuel_type: Gas/Electric/Hybrid
- weight_lbs: Curb weight
- range_miles: EV range (null for ICE)
- seating_capacity: Number of seats
- description: Marketing copy
- featured: Whether to highlight on homepage
- in_stock: Availability flag
- stock_count: Units available
- created_at

### car_images
Stores image URLs for each car (multiple per car).
- id: UUID primary key
- car_id: References cars
- url: Image URL
- alt: Alt text
- is_primary: Whether this is the hero image
- sort_order: Display order
- created_at

### favorites
Tracks user-favorited cars (anonymous, session-based via local storage key).
- id: UUID primary key
- car_id: References cars
- session_key: Anonymous user identifier
- created_at

### comparisons
Tracks active comparison sessions.
- id: UUID primary key
- car_ids: Array of car UUIDs being compared
- session_key: Anonymous user identifier
- created_at

### inquiries
Stores contact/test drive inquiry forms.
- id: UUID primary key
- car_id: References cars
- name, email, phone
- message
- inquiry_type: test_drive, pricing, general
- status: pending, contacted, closed
- created_at

### page_views
Analytics: tracks which cars are viewed.
- id: UUID primary key
- car_id: References cars
- viewed_at
*/

-- CARS
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  price numeric(12,2) NOT NULL,
  category text NOT NULL CHECK (category IN ('coupe', 'sedan', 'suv', 'convertible', 'hypercar', 'sports')),
  color text NOT NULL DEFAULT 'Black',
  color_hex text NOT NULL DEFAULT '#1a1a1a',
  horsepower integer,
  torque integer,
  top_speed_mph integer,
  acceleration_0_60 numeric(4,2),
  engine text,
  transmission text DEFAULT 'Automatic',
  drivetrain text DEFAULT 'RWD',
  fuel_type text DEFAULT 'Gas',
  weight_lbs integer,
  range_miles integer,
  seating_capacity integer DEFAULT 2,
  description text,
  featured boolean NOT NULL DEFAULT false,
  in_stock boolean NOT NULL DEFAULT true,
  stock_count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cars" ON cars;
CREATE POLICY "anon_select_cars" ON cars FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cars" ON cars;
CREATE POLICY "anon_insert_cars" ON cars FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cars" ON cars;
CREATE POLICY "anon_update_cars" ON cars FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cars" ON cars;
CREATE POLICY "anon_delete_cars" ON cars FOR DELETE TO anon, authenticated USING (true);

-- CAR IMAGES
CREATE TABLE IF NOT EXISTS car_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_car_images" ON car_images;
CREATE POLICY "anon_select_car_images" ON car_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_car_images" ON car_images;
CREATE POLICY "anon_insert_car_images" ON car_images FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_car_images" ON car_images;
CREATE POLICY "anon_update_car_images" ON car_images FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_car_images" ON car_images;
CREATE POLICY "anon_delete_car_images" ON car_images FOR DELETE TO anon, authenticated USING (true);

-- FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  session_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(car_id, session_key)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
CREATE POLICY "anon_select_favorites" ON favorites FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE TO anon, authenticated USING (true);

-- INQUIRIES
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  inquiry_type text NOT NULL DEFAULT 'general' CHECK (inquiry_type IN ('test_drive', 'pricing', 'general')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_inquiries" ON inquiries;
CREATE POLICY "anon_select_inquiries" ON inquiries FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_inquiries" ON inquiries;
CREATE POLICY "anon_insert_inquiries" ON inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_inquiries" ON inquiries;
CREATE POLICY "anon_update_inquiries" ON inquiries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- PAGE VIEWS
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_page_views" ON page_views;
CREATE POLICY "anon_select_page_views" ON page_views FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
CREATE POLICY "anon_insert_page_views" ON page_views FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cars_category ON cars(category);
CREATE INDEX IF NOT EXISTS idx_cars_featured ON cars(featured);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);
CREATE INDEX IF NOT EXISTS idx_favorites_session ON favorites(session_key);
CREATE INDEX IF NOT EXISTS idx_page_views_car_id ON page_views(car_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
