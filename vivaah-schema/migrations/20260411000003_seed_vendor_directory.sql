-- Seed: vendor_directory dummy data
-- Run in Supabase SQL Editor.
-- Replace the owner_user_id UUID below with your own user ID if different.
-- Your user ID: 4ecf1014-3a4c-45c3-ae9d-26d38c2e3520

DO $$
DECLARE
  v_owner uuid := '4ecf1014-3a4c-45c3-ae9d-26d38c2e3520';
BEGIN

INSERT INTO vendor_directory (owner_user_id, vendor_name, category, city, phone, notes, wedding_count, last_used_date) VALUES

-- ── PHOTOGRAPHY ───────────────────────────────────────────────────────────────
(v_owner, 'Frozen Frames Studio',       'Photography', 'Mumbai',    '9820011234', 'Candid specialists. Very reliable, always deliver on time. Preferred vendor.', 4, '2025-11-15'),
(v_owner, 'The Wedding Story',          'Photography', 'Mumbai',    '9821055678', 'High-end cinematic style. Slightly expensive but worth it for destination weddings.', 2, '2025-08-20'),
(v_owner, 'Shaadi Clicks',              'Photography', 'Delhi',     '9810123456', 'Great with large joint families. Good drone coverage included in package.', 3, '2025-12-01'),
(v_owner, 'Delhi Wedding Diaries',      'Photography', 'Delhi',     '9899234567', 'Budget-friendly option. Good for mehendi and haldi coverage.', 1, '2025-06-10'),
(v_owner, 'Light & Shadow Studios',     'Photography', 'Bangalore', '9845678901', 'Award-winning candid team. 2 shooters + 1 videographer standard.', 5, '2026-01-20'),
(v_owner, 'The Story Tellers',          'Photography', 'Bangalore', '9886543210', 'Known for pre-wedding shoots. Good for destination coverage too.', 2, '2025-10-05'),
(v_owner, 'Pearl Lens Photography',     'Photography', 'Hyderabad', '9948012345', 'Strong in traditional coverage. Also does aerial videography.', 3, '2025-09-18'),
(v_owner, 'Noor Studios',               'Photography', 'Hyderabad', '9849876543', 'Specialises in Muslim weddings. Excellent indoor lighting work.', 2, '2025-07-22'),
(v_owner, 'Royal Captures',             'Photography', 'Jaipur',    '9414012345', 'Best for palace and heritage venue shoots. Rajasthani wedding expert.', 4, '2026-02-10'),
(v_owner, 'Pink City Photography',      'Photography', 'Jaipur',    '9829567890', 'Affordable and punctual. Good for full-day multi-event coverage.', 1, '2025-05-30'),

-- ── VENUE ─────────────────────────────────────────────────────────────────────
(v_owner, 'Sea Princess Banquet',       'Venue',       'Mumbai',    '2226460606', 'Sea-facing lawns. Good for 400–800 pax. Pre-monsoon bookings needed 8 months ahead.', 3, '2025-11-20'),
(v_owner, 'Taj Lands End',              'Venue',       'Mumbai',    '2266681234', 'Premium 5-star. Excellent in-house catering. Budget ₹35L+ for banquet hall.', 2, '2025-09-05'),
(v_owner, 'The Leela Palace Delhi',     'Venue',       'Delhi',     '1139330808', 'Top-tier luxury venue. Preferred for NRI weddings. Valet and concierge included.', 2, '2025-12-15'),
(v_owner, 'Hyatt Regency Delhi',        'Venue',       'Delhi',     '1126791234', 'Good mid-luxury option. Flexible on external caterers. Book 6 months ahead.', 3, '2025-08-10'),
(v_owner, 'Taj West End',               'Venue',       'Bangalore', '8022255055', 'Heritage garden venue. Ideal for 200–500 pax. Outdoor and indoor options.', 4, '2026-01-08'),
(v_owner, 'ITC Windsor',                'Venue',       'Bangalore', '8022269898', 'Colonial architecture. Strong F&B team. Good for corporate-style weddings.', 2, '2025-10-22'),
(v_owner, 'Novotel HICC',               'Venue',       'Hyderabad', '4023101234', 'Convention centre attached. Good for 1000+ pax. Strong AV infrastructure.', 1, '2025-07-15'),
(v_owner, 'Falaknuma Palace',           'Venue',       'Hyderabad', '4066291234', 'Nizam-era heritage palace. Limited dates. Book 12 months ahead. Premium only.', 3, '2025-11-01'),
(v_owner, 'Rambagh Palace',             'Venue',       'Jaipur',    '1412385700', 'Most iconic Jaipur venue. Polo ground for baraat. Premium international clientele.', 5, '2026-02-25'),
(v_owner, 'Jai Mahal Palace',           'Venue',       'Jaipur',    '1412223636', 'Good alternative to Rambagh. Slightly more affordable. Beautiful Mughal gardens.', 2, '2025-09-12'),

-- ── CATERING ──────────────────────────────────────────────────────────────────
(v_owner, 'Rasoi Catering Mumbai',      'Catering',    'Mumbai',    '9820345678', 'Strong Gujarati and Marathi thali spreads. Handles up to 1500 pax. FSSAI certified.', 4, '2025-12-05'),
(v_owner, 'Grand Feast Mumbai',         'Catering',    'Mumbai',    '9867123456', 'Multi-cuisine specialists. Good live counters. Slightly premium pricing.', 2, '2025-08-18'),
(v_owner, 'Annapurna Caterers',         'Catering',    'Delhi',     '9810567890', 'North Indian specialists. Excellent dal makhani and kebab stations.', 5, '2026-01-15'),
(v_owner, 'Royal Feast Delhi',          'Catering',    'Delhi',     '9899345678', 'Known for Mughlai spreads. Good for 500–2000 pax. Manages own staff well.', 3, '2025-10-28'),
(v_owner, 'Sarvana Caterers',           'Catering',    'Bangalore', '9845234567', 'South Indian vegetarian experts. Best idli/dosa live counter in the city.', 4, '2025-11-10'),
(v_owner, 'Malgudi Kitchen',            'Catering',    'Bangalore', '9886012345', 'Mixed veg/non-veg packages. Good value. Works well with Taj West End.', 2, '2025-07-30'),
(v_owner, 'Shadab Caterers',            'Catering',    'Hyderabad', '9948567890', 'Hyderabadi biryani specialists. Famous dum biryani station. Non-veg only.', 3, '2025-09-22'),
(v_owner, 'Royal Darbar Caterers',      'Catering',    'Hyderabad', '9849012345', 'Both veg and non-veg. Good South Indian breakfast for morning functions.', 2, '2025-06-15'),
(v_owner, 'Rajwada Caterers',           'Catering',    'Jaipur',    '9414567890', 'Dal baati churma specialists. Rajasthani thali for 300–1500 pax.', 4, '2026-02-18'),
(v_owner, 'Pink City Feast',            'Catering',    'Jaipur',    '9829123456', 'Good multi-cuisine. Manages heritage venue logistics well.', 1, '2025-05-20'),

-- ── DECOR ─────────────────────────────────────────────────────────────────────
(v_owner, 'Dream Décor Mumbai',         'Decor',       'Mumbai',    '9820789012', 'Floral and fabric specialists. Good for mandap and stage. 3 week lead time.', 3, '2025-11-25'),
(v_owner, 'Floral Fantasy Mumbai',      'Decor',       'Mumbai',    '9867456789', 'Fresh flower specialists. Excellent rose and marigold work. Trusted vendor.', 4, '2025-12-08'),
(v_owner, 'Shaadi Decor Delhi',         'Decor',       'Delhi',     '9810901234', 'Full décor packages including lighting and draping. Strong team of 30+.', 5, '2026-01-20'),
(v_owner, 'Royal Decoration Delhi',     'Decor',       'Delhi',     '9899678901', 'Heritage and royal themes. Elephant props and vintage items available.', 2, '2025-09-30'),
(v_owner, 'Blossoms Event Décor',       'Decor',       'Bangalore', '9845890123', 'Contemporary minimal style. Good for destination-style mandaps.', 3, '2025-10-15'),
(v_owner, 'Green Leaf Décor',           'Decor',       'Bangalore', '9886789012', 'Eco-friendly décor. Terracotta and natural elements. Increasingly popular.', 2, '2025-08-05'),
(v_owner, 'Mughal Motifs Decor',        'Decor',       'Hyderabad', '9948890123', 'Specialises in Nizami and Mughal themes. Excellent for Falaknuma Palace events.', 4, '2025-11-08'),
(v_owner, 'Zyra Décor',                 'Decor',       'Hyderabad', '9849345678', 'Modern floral and lighting. Good for poolside and terrace setups.', 2, '2025-07-10'),
(v_owner, 'Haveli Décor',               'Decor',       'Jaipur',    '9414890123', 'Rajasthani folk décor specialists. Phool bungla and traditional setups.', 5, '2026-02-28'),
(v_owner, 'Mewar Décor',                'Decor',       'Jaipur',    '9829890123', 'Palace and haveli themed setups. Camel props and vintage Rajputana style.', 3, '2025-10-01'),

-- ── MAKEUP ────────────────────────────────────────────────────────────────────
(v_owner, 'Swapna Bridal Studio',       'Makeup',      'Mumbai',    '9820234567', 'HD and airbrush specialists. 3 artists available for same-day multi-event bookings.', 4, '2025-12-10'),
(v_owner, 'Bridal Bliss Mumbai',        'Makeup',      'Mumbai',    '9867890123', 'Affordable bridal packages. Good for mehendi and haldi looks. Punctual.', 2, '2025-08-25'),
(v_owner, 'Delhi Bridal Glow',          'Makeup',      'Delhi',     '9810456789', 'Heavy traditional bridal looks. Strong in Punjabi and Sindhi wedding styles.', 5, '2026-01-25'),
(v_owner, 'Meenu Makeup Artist',        'Makeup',      'Delhi',     '9899012345', 'Natural and dewy look specialist. Good trial sessions included in package.', 3, '2025-11-05'),
(v_owner, 'Chaitra Bridal Studio',      'Makeup',      'Bangalore', '9845345678', 'South Indian bridal gold jewellery styling expertise. Traditional looks.', 4, '2025-10-18'),
(v_owner, 'Bangalore Beauty Brides',    'Makeup',      'Bangalore', '9886234567', 'Modern and fusion bridal looks. Strong for reception and engagement.', 2, '2025-09-08'),
(v_owner, 'Swathy Bridal Makeup',       'Makeup',      'Hyderabad', '9948234567', 'Telangana and Andhra traditional bridal specialist. Pattu saree draping included.', 3, '2025-07-28'),
(v_owner, 'Hyderabad Makeovers',        'Makeup',      'Hyderabad', '9849678901', 'HD airbrush. Good for Muslim bridal looks. Strong team of 4 artists.', 2, '2025-06-20'),
(v_owner, 'Jaipur Bridal Makeover',     'Makeup',      'Jaipur',    '9414234567', 'Rajasthani bridal with leheriya draping. Traditional and fusion both.', 4, '2026-02-05'),
(v_owner, 'Pink City Brides',           'Makeup',      'Jaipur',    '9829234567', 'Budget-friendly bridal packages. Good for 3–5 function bookings.', 2, '2025-09-25');

END $$;
