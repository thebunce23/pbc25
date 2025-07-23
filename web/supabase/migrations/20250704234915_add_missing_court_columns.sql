-- Add missing columns to courts table if they don't exist
ALTER TABLE courts ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('Indoor', 'Outdoor'));
ALTER TABLE courts ADD COLUMN IF NOT EXISTS surface text;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active';
ALTER TABLE courts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 25;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS length numeric DEFAULT 44;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS width numeric DEFAULT 20;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS lighting boolean DEFAULT false;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS air_conditioning boolean DEFAULT false;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS accessibility boolean DEFAULT false;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS amenities text[];
ALTER TABLE courts ADD COLUMN IF NOT EXISTS last_maintenance date;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS next_maintenance date;

-- Update existing courts with sample data if they don't have type set
UPDATE courts SET 
  type = CASE 
    WHEN name LIKE '%A%' OR name LIKE '%B%' THEN 'Indoor'
    ELSE 'Outdoor'
  END,
  surface = CASE
    WHEN name LIKE '%A%' THEN 'Concrete'
    WHEN name LIKE '%B%' THEN 'Synthetic' 
    WHEN name LIKE '%C%' THEN 'Asphalt'
    ELSE 'Sport Court'
  END,
  status = CASE
    WHEN name LIKE '%C%' THEN 'maintenance'
    ELSE 'active'
  END,
  description = 'Court description for ' || name,
  lighting = true,
  air_conditioning = CASE WHEN type = 'Indoor' THEN true ELSE false END,
  accessibility = true,
  amenities = ARRAY['Lighting']
WHERE type IS NULL;

-- Insert sample courts if table is empty
INSERT INTO courts (name, type, surface, status, description, hourly_rate, length, width, lighting, air_conditioning, accessibility, amenities)
SELECT 'Court A', 'Indoor', 'Concrete', 'active', 'Main indoor court with excellent lighting', 25, 44, 20, true, true, true, ARRAY['Lighting', 'AC', 'Sound System']
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Court A');

INSERT INTO courts (name, type, surface, status, description, hourly_rate, length, width, lighting, air_conditioning, accessibility, amenities)
SELECT 'Court B', 'Indoor', 'Synthetic', 'active', 'Premium synthetic surface court', 30, 44, 20, true, true, false, ARRAY['Lighting', 'AC', 'Premium Surface']
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Court B');

INSERT INTO courts (name, type, surface, status, description, hourly_rate, length, width, lighting, air_conditioning, accessibility, amenities)
SELECT 'Court C', 'Outdoor', 'Asphalt', 'maintenance', 'Outdoor court with night lighting', 15, 44, 20, true, false, true, ARRAY['Lighting', 'Wheelchair Accessible']
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Court C');

INSERT INTO courts (name, type, surface, status, description, hourly_rate, length, width, lighting, air_conditioning, accessibility, amenities)
SELECT 'Court D', 'Outdoor', 'Sport Court', 'active', 'Premium outdoor court', 20, 44, 20, true, false, true, ARRAY['Lighting', 'Premium Surface', 'Wheelchair Accessible']
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Court D');
