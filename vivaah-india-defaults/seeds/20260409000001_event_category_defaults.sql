-- seeds/20260409000001_event_category_defaults.sql

CREATE TABLE IF NOT EXISTS event_category_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  category_name text NOT NULL,
  display_order integer NOT NULL,
  is_platform_default boolean NOT NULL DEFAULT true
);

-- Clear existing defaults to ensure idempotency
DELETE FROM event_category_defaults;

INSERT INTO event_category_defaults (event_type, category_name, display_order) VALUES
  ('haldi', 'Photographer', 1),
  ('haldi', 'Caterer — snacks and beverages', 2),
  ('haldi', 'Décor', 3),
  ('haldi', 'Makeup artist', 4),
  ('haldi', 'Mehendi artist', 5),

  ('mehendi', 'Mehendi artist', 1),
  ('mehendi', 'Photographer', 2),
  ('mehendi', 'Caterer — snacks and beverages', 3),
  ('mehendi', 'Décor', 4),

  ('sangeet', 'DJ / live music', 1),
  ('sangeet', 'Photographer', 2),
  ('sangeet', 'Videographer', 3),
  ('sangeet', 'Caterer', 4),
  ('sangeet', 'Décor', 5),
  ('sangeet', 'Lighting', 6),

  ('engagement', 'Venue', 1),
  ('engagement', 'Caterer', 2),
  ('engagement', 'Photographer', 3),
  ('engagement', 'Décor', 4),
  ('engagement', 'Florist', 5),
  ('engagement', 'Makeup artist', 6),

  ('wedding', 'Venue', 1),
  ('wedding', 'Caterer', 2),
  ('wedding', 'Photographer', 3),
  ('wedding', 'Videographer', 4),
  ('wedding', 'Décor', 5),
  ('wedding', 'Florist', 6),
  ('wedding', 'Priest / pandit', 7),
  ('wedding', 'Mehendi artist', 8),
  ('wedding', 'Baraat — band / DJ', 9),
  ('wedding', 'Lighting', 10),
  ('wedding', 'Makeup artist — bride', 11),
  ('wedding', 'Makeup artist — groom / groomsmen', 12),

  ('reception', 'Venue', 1),
  ('reception', 'Caterer', 2),
  ('reception', 'Photographer', 3),
  ('reception', 'Videographer', 4),
  ('reception', 'Décor', 5),
  ('reception', 'DJ / live music', 6),
  ('reception', 'Lighting', 7),
  ('reception', 'Florist', 8);
