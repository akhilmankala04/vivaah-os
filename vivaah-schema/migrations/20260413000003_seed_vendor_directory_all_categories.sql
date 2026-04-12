-- Seed: vendor_directory — all remaining categories
-- Adds vendors for every new category not covered in 20260411000003_seed_vendor_directory.sql
-- User ID: 4ecf1014-3a4c-45c3-ae9d-26d38c2e3520

DO $$
DECLARE
  v_owner uuid := '4ecf1014-3a4c-45c3-ae9d-26d38c2e3520';
BEGIN

INSERT INTO vendor_directory (owner_user_id, vendor_name, category, city, phone, notes, wedding_count, last_used_date) VALUES

-- ── VIDEOGRAPHY ───────────────────────────────────────────────────────────────
(v_owner, 'Cinematic Shaadi Films',     'Videography',  'Mumbai',    '9820112233', 'Cinematic highlight reels. 4K drone footage included. 6-week delivery.', 3, '2025-11-18'),
(v_owner, 'Frame by Frame Films',       'Videography',  'Delhi',     '9810223344', 'Documentary-style coverage. Same-day edit available for extra charge.', 4, '2026-01-10'),
(v_owner, 'Bengaluru Wedding Films',    'Videography',  'Bangalore', '9845334455', 'Aerial and ground coverage. 2-camera setup standard. Strong editing team.', 2, '2025-10-22'),
(v_owner, 'Deccan Wedding Films',       'Videography',  'Hyderabad', '9948445566', 'Full-day coverage with highlights + full-length edit. Reliable team.', 3, '2025-09-14'),
(v_owner, 'Rajputana Reels',            'Videography',  'Jaipur',    '9414556677', 'Heritage venue specialists. Horse-mounted camera shots available.', 2, '2026-02-12'),

-- ── DRONE ─────────────────────────────────────────────────────────────────────
(v_owner, 'SkyShot India Mumbai',       'Drone',        'Mumbai',    '9867223344', 'DGCA-certified drone operator. 4K aerial coverage. Coastal area permits handled.', 3, '2025-12-02'),
(v_owner, 'AerialWeds Delhi',           'Drone',        'Delhi',     '9899334455', 'Licensed for South Delhi and NCR venues. Works with most photography teams.', 2, '2025-11-15'),
(v_owner, 'CloudFrames Bangalore',      'Drone',        'Bangalore', '9886445566', 'Trained operators. Good for Nandi Hills and resort weddings.', 1, '2025-08-20'),
(v_owner, 'Sky Capture Hyderabad',      'Drone',        'Hyderabad', '9948556677', 'Open ground specialists. Works well for Falaknuma outdoor ceremonies.', 2, '2025-10-05'),

-- ── PHOTO BOOTH ───────────────────────────────────────────────────────────────
(v_owner, 'Snap & Shaadi Mumbai',       'Photo Booth',  'Mumbai',    '9820334455', 'Mirror booth with instant prints. Props customised to wedding theme.', 2, '2025-11-28'),
(v_owner, 'Booth Baarat Delhi',         'Photo Booth',  'Delhi',     '9810445566', '360 video booth + standard photo booth. Digital delivery same day.', 3, '2026-01-05'),
(v_owner, 'Click & Celebrate Blr',      'Photo Booth',  'Bangalore', '9845556677', 'GIF and Boomerang booth. Custom backdrop with couple names.', 1, '2025-09-18'),

-- ── HAIR STYLIST ──────────────────────────────────────────────────────────────
(v_owner, 'Tress Tales Mumbai',         'Hair Stylist', 'Mumbai',    '9867334455', 'Bridal hair specialist. Traditional and modern looks. Travels to venue.', 3, '2025-12-05'),
(v_owner, 'Strand Story Delhi',         'Hair Stylist', 'Delhi',     '9899445566', 'Heavy bun and gajra styles. Works with Delhi Bridal Glow makeup team.', 4, '2026-01-22'),
(v_owner, 'Silk & Strand Bangalore',    'Hair Stylist', 'Bangalore', '9886556677', 'South Indian flower setting specialists. Works with jasmine and roses.', 2, '2025-10-08'),
(v_owner, 'Royal Tresses Jaipur',       'Hair Stylist', 'Jaipur',    '9829334455', 'Rajasthani braid and maang tikka styling. Traditional and fusion.', 2, '2026-02-08'),

-- ── MEHENDI ───────────────────────────────────────────────────────────────────
(v_owner, 'Gulnaar Mehendi Mumbai',     'Mehendi',      'Mumbai',    '9820556677', 'Arabic and Indian designs. 3-artist team for 100+ guests. Colour mehendi available.', 4, '2025-12-12'),
(v_owner, 'Rajasthan Henna Delhi',      'Mehendi',      'Delhi',     '9810667788', 'Jaipur-trained artists. Heavy bridal mehendi with portrait work.', 5, '2026-01-28'),
(v_owner, 'Nalini Mehendi Bangalore',   'Mehendi',      'Bangalore', '9845778899', 'South Indian kolam-inspired mehendi. Full arms and legs package.', 3, '2025-11-02'),
(v_owner, 'Noor Mehendi Hyderabad',     'Mehendi',      'Hyderabad', '9948889900', 'Arabic and traditional. 4-artist team. Known for intricate groom mehendi.', 2, '2025-08-15'),
(v_owner, 'Pink City Mehendi',          'Mehendi',      'Jaipur',    '9414667788', 'Jaipur specialists. Natural herbal mehendi only. Quick application.', 4, '2026-02-20'),

-- ── BRIDAL WEAR ───────────────────────────────────────────────────────────────
(v_owner, 'Sabyasachi Mumbai Store',    'Bridal Wear',  'Mumbai',    '2223691234', 'Premium couture lehengas. 4-month lead time. Appointment required.', 2, '2025-11-10'),
(v_owner, 'Ensemble Mumbai',            'Bridal Wear',  'Mumbai',    '2222041234', 'Multi-designer boutique. Manish Malhotra and Tarun Tahiliani stocked.', 3, '2025-09-05'),
(v_owner, 'Chandni Chowk Bridal House', 'Bridal Wear',  'Delhi',     '9810778899', 'Traditional Banarasi and Kanjeevaram. Unbeatable value for heavy lehengas.', 4, '2026-01-18'),
(v_owner, 'Frontier Raas Delhi',        'Bridal Wear',  'Delhi',     '9899556677', 'Budget to mid-range. Good for bridesmaids and family outfits too.', 2, '2025-10-15'),
(v_owner, 'Nalli Silks Bangalore',      'Bridal Wear',  'Bangalore', '9845889900', 'Kanjeevaram silk specialists. Best for South Indian traditional brides.', 5, '2025-12-18'),
(v_owner, 'Kalanikethan Hyderabad',     'Bridal Wear',  'Hyderabad', 'XXXXXXXXXX', 'Wide collection of pattu sarees and bridal lehengas. Trusted for generations.', 3, '2025-07-20'),

-- ── GROOM WEAR ────────────────────────────────────────────────────────────────
(v_owner, 'Manyavar Mumbai',            'Groom Wear',   'Mumbai',    '9820667788', 'Sherwani and bandhgala. Good range of kurta-pajama for baraat.', 4, '2025-12-15'),
(v_owner, 'Jodhpuri Royals Delhi',      'Groom Wear',   'Delhi',     '9810889900', 'Custom bandhgala and jodhpuri suits. 3-week turnaround.', 3, '2026-01-30'),
(v_owner, 'The Groom Room Bangalore',   'Groom Wear',   'Bangalore', '9886667788', 'Contemporary groom styling. Designer sherwanis and western suits.', 2, '2025-09-25'),
(v_owner, 'Shahin Tailors Hyderabad',   'Groom Wear',   'Hyderabad', '9948667788', 'Custom sherwani specialists. Known for embroidery work. 4-week lead time.', 2, '2025-08-10'),

-- ── JEWELLERY ─────────────────────────────────────────────────────────────────
(v_owner, 'Tribhovandas Bhimji Mumbai', 'Jewellery',    'Mumbai',    '2222610261', 'Premium gold and diamond. Bridal sets on order. Book 3 months ahead.', 2, '2025-11-22'),
(v_owner, 'Tanishq Mumbai',             'Jewellery',    'Mumbai',    '2226001234', 'Reliable hallmarked jewellery. Good for family gifting sets too.', 3, '2025-09-30'),
(v_owner, 'Dariba Kalan Jewellers',     'Jewellery',    'Delhi',     '9810990011', 'Old Delhi silver and gold. Unbeatable prices. Custom kaleere and maangtikka.', 4, '2026-01-08'),
(v_owner, 'PC Jewellers Bangalore',     'Jewellery',    'Bangalore', '9845990011', 'Wide range of south Indian temple jewellery. Gold and stone sets.', 2, '2025-10-28'),
(v_owner, 'Mangatrai Hyderabad',        'Jewellery',    'Hyderabad', '9948778899', 'Hyderabadi pearl specialists. Unakoti and Nizami designs.', 3, '2025-09-05'),
(v_owner, 'Amrapali Jaipur',            'Jewellery',    'Jaipur',    '9414889900', 'Kundan and meenakari specialists. Silver jewellery for family.', 4, '2026-02-22'),

-- ── FLORIST ───────────────────────────────────────────────────────────────────
(v_owner, 'Phool Waale Mumbai',         'Florist',      'Mumbai',    '9867445566', 'Fresh flower specialists. Marigold, rose and tube rose for mandap and car.', 3, '2025-12-08'),
(v_owner, 'Bloom & Bliss Delhi',        'Florist',      'Delhi',     '9899667788', 'Orchid and lily wedding florals. Bouquet design on request.', 2, '2026-01-15'),
(v_owner, 'Garden Dreams Bangalore',    'Florist',      'Bangalore', '9886778899', 'Local fresh flowers. Good for eco-friendly weddings. Jasmine specialists.', 4, '2025-11-05'),
(v_owner, 'Gulshan Florists Hyderabad', 'Florist',      'Hyderabad', '9948990011', 'Bulk fresh flower supply. Good for large 1000+ pax events.', 2, '2025-08-25'),

-- ── LIGHTING ──────────────────────────────────────────────────────────────────
(v_owner, 'Luminary Events Mumbai',     'Lighting',     'Mumbai',    '9820778899', 'LED canopy and facade lighting specialists. Provides own generators.', 3, '2025-12-01'),
(v_owner, 'Roshan Lights Delhi',        'Lighting',     'Delhi',     '9810001122', 'Complete wedding lighting packages. String lights, uplighters and spotlights.', 5, '2026-01-25'),
(v_owner, 'Sparkle Lights Bangalore',   'Lighting',     'Bangalore', '9845001122', 'Modern LED setups. Good for poolside and garden venues.', 2, '2025-10-12'),
(v_owner, 'Hyderabad Light Co',         'Lighting',     'Hyderabad', '9948001122', 'Floodlighting and fairy lights. Drone light shows on request.', 2, '2025-09-28'),
(v_owner, 'Desert Glow Jaipur',         'Lighting',     'Jaipur',    '9414001122', 'Majestic golden and amber setups for palace venues.', 3, '2026-02-15'),

-- ── RANGOLI ARTIST ────────────────────────────────────────────────────────────
(v_owner, 'Mandala Arts Mumbai',        'Rangoli Artist', 'Mumbai',  '9867556677', 'Large-scale rangoli for entrance and mandap. Dry colour and flower rangoli.', 2, '2025-11-30'),
(v_owner, 'Kolam Queens Bangalore',     'Rangoli Artist', 'Bangalore','9886889900', 'Traditional kolam and modern rangoli. 2-person team for full setup.', 3, '2025-10-18'),
(v_owner, 'Siddhi Rangoli Hyderabad',   'Rangoli Artist', 'Hyderabad','9948112233', 'Mughal floral patterns. 3D rangoli available. 5–8 hour setup.', 1, '2025-07-05'),

-- ── DJ ────────────────────────────────────────────────────────────────────────
(v_owner, 'DJ Akhil Mumbai',            'DJ',           'Mumbai',    '9820890011', 'Bollywood and Punjabi specialist. Full sound system included. Travels outstation.', 4, '2025-12-10'),
(v_owner, 'DJ Sukhi Delhi',             'DJ',           'Delhi',     '9810112233', 'Top Delhi sangeet DJ. Bhangra and Bollywood mixes. LED dance floor available.', 5, '2026-01-28'),
(v_owner, 'DJ Naveen Bangalore',        'DJ',           'Bangalore', '9845223344', 'South Indian and Bollywood mix. Good for 200–800 pax. Own lighting rig.', 3, '2025-11-08'),
(v_owner, 'DJ Zaid Hyderabad',          'DJ',           'Hyderabad', '9948334455', 'Known for fusion sets. Arabic, Bollywood and Telugu hits. Strong bass setup.', 2, '2025-08-30'),
(v_owner, 'DJ Rajveer Jaipur',          'DJ',           'Jaipur',    '9414223344', 'Rajasthani folk fusion. Good for baraat processions and sangeet.', 3, '2026-02-08'),

-- ── BAND / BARAAT ─────────────────────────────────────────────────────────────
(v_owner, 'Shahi Brass Band Mumbai',    'Band / Baraat', 'Mumbai',   '9867667788', '25-piece brass band. LED costumes. Handles procession up to 2 km.', 3, '2025-12-05'),
(v_owner, 'Delhi Dhumal Band',          'Band / Baraat', 'Delhi',    '9899778899', 'Traditional dhol and brass. Bhangra dancers available as add-on.', 5, '2026-01-20'),
(v_owner, 'Mysore Panchevadyam',        'Band / Baraat', 'Bangalore','9886001122', 'Traditional Karnataka wedding band. Nadaswaram and shehnai specialists.', 2, '2025-10-05'),
(v_owner, 'Hyderabad Nadaswaram',       'Band / Baraat', 'Hyderabad','9948223344', 'Classical shehnai and tabla. Traditional Deccan wedding procession.', 3, '2025-09-10'),
(v_owner, 'Rajasthani Brass Band',      'Band / Baraat', 'Jaipur',   '9414334455', 'Camel-led baraat specialists. Folk musicians and dancers included.', 4, '2026-02-25'),

-- ── LIVE MUSIC / PERFORMER ────────────────────────────────────────────────────
(v_owner, 'Sangeet Stars Mumbai',       'Live Music / Performer', 'Mumbai',    '9820001122', 'Bollywood singer for sangeet. Backing tracks or live band. 2-hour set.', 2, '2025-11-20'),
(v_owner, 'The Wedding Singers Delhi',  'Live Music / Performer', 'Delhi',     '9810334455', 'Duo vocalists. Hindi and Punjabi repertoire. Acoustic and amplified options.', 3, '2026-01-12'),
(v_owner, 'Carnatic Ensemble Blr',      'Live Music / Performer', 'Bangalore', '9845445566', 'Classical Carnatic for wedding rituals. Violin, mridangam and veena.', 2, '2025-09-22'),
(v_owner, 'Sufi Nights Hyderabad',      'Live Music / Performer', 'Hyderabad', '9948556677', 'Qawwali and ghazal performances. 4-piece ensemble. Perfect for mehndi eve.', 3, '2025-08-05'),

-- ── CHOREOGRAPHER ─────────────────────────────────────────────────────────────
(v_owner, 'Taal Mumbai',                'Choreographer','Mumbai',    '9867778899', 'Sangeet choreography for bride and groom sides. 6–8 session packages.', 3, '2025-12-08'),
(v_owner, 'Dance India Dance Delhi',    'Choreographer','Delhi',     '9899890011', 'Large group choreography specialist. Flash mob style performances.', 4, '2026-01-18'),
(v_owner, 'Footloose Bangalore',        'Choreographer','Bangalore', '9886112233', 'Contemporary and classical fusion. Good for young wedding parties.', 2, '2025-10-28'),
(v_owner, 'Steps Hyderabad',            'Choreographer','Hyderabad', '9948667788', 'Bollywood and Telugu film-style choreography. Video of routines provided.', 2, '2025-07-25'),

-- ── FIREWORKS ─────────────────────────────────────────────────────────────────
(v_owner, 'Starfire Pyrotechnics',      'Fireworks',    'Mumbai',    '9820223344', 'Licensed pyrotechnics. 15-minute ground display. Safety cordons managed.', 3, '2025-12-15'),
(v_owner, 'Diamond Fireworks Delhi',    'Fireworks',    'Delhi',     '9810445566', 'Aerial shells and ground burst combinations. PESO certified.', 2, '2026-01-22'),
(v_owner, 'Sky Magic Bangalore',        'Fireworks',    'Bangalore', '9845556677', 'Cold sparkler fountains (indoor safe). Traditional fireworks for outdoor.', 1, '2025-09-15'),
(v_owner, 'Jaipur Aatishbaazi',         'Fireworks',    'Jaipur',    '9414445566', 'Traditional patakhe and aerial display. Heritage venue specialists.', 3, '2026-02-28'),

-- ── HORSE / GHODI ─────────────────────────────────────────────────────────────
(v_owner, 'Royal Ghodi Mumbai',         'Horse / Ghodi','Mumbai',    '9867889900', 'White decorated ghodi for baraat. Handler included. Max 3 km procession.', 3, '2025-12-10'),
(v_owner, 'Shahi Ashwa Delhi',          'Horse / Ghodi','Delhi',     '9899001122', 'White and grey horses available. Floral decoration and handler included.', 4, '2026-01-20'),
(v_owner, 'Rajputana Horses Jaipur',    'Horse / Ghodi','Jaipur',    '9414556677', 'Marwari horse specialists. Camel available as add-on for heritage venues.', 5, '2026-02-20'),
(v_owner, 'Heritage Horses Hyderabad',  'Horse / Ghodi','Hyderabad', '9948778900', 'White horses with full baraat decoration. Accompanies band.', 2, '2025-09-18'),

-- ── EVENT COORDINATOR ─────────────────────────────────────────────────────────
(v_owner, 'Wedlock Events Mumbai',      'Event Coordinator', 'Mumbai',    '9820334567', 'Full-service coordination. 3 coordinators for multi-day functions.', 4, '2025-12-12'),
(v_owner, 'Aisle & Beyond Delhi',       'Event Coordinator', 'Delhi',     '9810556789', 'Destination and local weddings. Strong vendor negotiation skills.', 3, '2026-01-25'),
(v_owner, 'Bengaluru Wedding Planners', 'Event Coordinator', 'Bangalore', '9886223344', 'Budget management and on-day coordination. Good for 200–1000 pax.', 2, '2025-11-10'),
(v_owner, 'The Wedding Blueprint Hyd',  'Event Coordinator', 'Hyderabad', '9948334456', 'Expert in Hyderabadi wedding logistics. Muslim and Hindu weddings.', 3, '2025-09-20'),
(v_owner, 'Royal Weddings Jaipur',      'Event Coordinator', 'Jaipur',    '9414667789', 'Heritage venue specialists. Handles palace logistics and permissions.', 4, '2026-02-10'),

-- ── PANDIT / PRIEST ───────────────────────────────────────────────────────────
(v_owner, 'Pandit Ramesh Sharma',       'Pandit / Priest', 'Mumbai',    '9820445678', 'Hindi and Sanskrit rituals. Experienced with NRI and destination weddings.', 5, '2025-12-08'),
(v_owner, 'Pandit Krishnamurthy',       'Pandit / Priest', 'Bangalore', '9886334455', 'South Indian Vedic rituals. Iyengar and Iyer specialisations.', 4, '2025-11-18'),
(v_owner, 'Pandit Suresh Mishra',       'Pandit / Priest', 'Delhi',     '9810667890', 'North Indian Hindu rituals. Arya Samaj and traditional Vedic both available.', 3, '2026-01-28'),
(v_owner, 'Pandit Venkateshwara Rao',   'Pandit / Priest', 'Hyderabad', '9948445567', 'Telugu and Kannada Vedic rituals. Muhurat timing expertise.', 3, '2025-09-12'),

-- ── ASTROLOGER / JYOTISHI ─────────────────────────────────────────────────────
(v_owner, 'Jyotishi Pt. Devdutt',       'Astrologer / Jyotishi', 'Mumbai',    '9820556789', 'Muhurat and kundali matching. Available for in-person or video consultation.', 3, '2025-12-01'),
(v_owner, 'Dr. Rajesh Joshi Jyotishi',  'Astrologer / Jyotishi', 'Delhi',     '9810778901', 'Vedic astrology and panchang. Written muhurat certificates provided.', 4, '2026-01-15'),
(v_owner, 'Pandit Shrinivas Iyengar',   'Astrologer / Jyotishi', 'Bangalore', '9886445567', 'South Indian Panchangam specialist. Tamil and Kannada almanacs.', 2, '2025-10-20'),

-- ── SECURITY ──────────────────────────────────────────────────────────────────
(v_owner, 'SafeGuard Events Mumbai',    'Security',     'Mumbai',    '9820667890', 'Licensed security firm. Crowd management for 500–5000 pax. Uniformed staff.', 2, '2025-12-05'),
(v_owner, 'ShieldForce Delhi',          'Security',     'Delhi',     '9810890012', 'Ex-army event security. Parking management included. 6-hour minimums.', 3, '2026-01-20'),
(v_owner, 'Bangalore Event Security',   'Security',     'Bangalore', '9886556678', 'CCTV setup + personnel. Good for large venue perimeter management.', 1, '2025-09-28'),

-- ── TRANSPORT ─────────────────────────────────────────────────────────────────
(v_owner, 'Shaadi Wheels Mumbai',       'Transport',    'Mumbai',    '9867001122', 'Vintage car for bridal entry. Also fleet of tempo travellers for guests.', 3, '2025-12-15'),
(v_owner, 'Royal Coaches Delhi',        'Transport',    'Delhi',     '9899112233', 'AC buses and cars. Airport transfers + hotel-venue shuttles.', 4, '2026-01-28'),
(v_owner, 'WeddingWheels Bangalore',    'Transport',    'Bangalore', '9845667789', 'Luxury car rentals and mini bus. Good for resort venues outside city.', 2, '2025-11-05'),
(v_owner, 'Nawab Transport Hyderabad',  'Transport',    'Hyderabad', '9948889901', 'Full fleet management for multi-day events. Outstation travel handled.', 2, '2025-08-20'),
(v_owner, 'Heritage Wheels Jaipur',     'Transport',    'Jaipur',    '9414778901', 'Vintage royal carriages and modern fleet. Camel carts available.', 3, '2026-02-18'),

-- ── ACCOMMODATION ─────────────────────────────────────────────────────────────
(v_owner, 'Trident Nariman Point',      'Accommodation','Mumbai',    '2266321234', '5-star. Good room block rates for outstation guests. Sea view rooms.', 2, '2025-11-20'),
(v_owner, 'The Claridges Delhi',        'Accommodation','Delhi',     '1123955000', 'Heritage hotel. Block booking for 20–200 rooms. Central location.', 3, '2026-01-10'),
(v_owner, 'Sheraton Grand Bangalore',   'Accommodation','Bangalore', '8022263000', 'Good for NRI guests. Near airport and ITPL. Family suites available.', 2, '2025-10-15'),
(v_owner, 'Taj Krishna Hyderabad',      'Accommodation','Hyderabad', '4066661234', 'Premium block booking. Good proximity to Novotel HICC venue.', 2, '2025-09-08'),
(v_owner, 'Samode Haveli',              'Accommodation','Jaipur',    '1412632407', 'Heritage haveli. Entire property booking available. 22 rooms.', 3, '2026-02-05'),

-- ── INVITATION CARDS ──────────────────────────────────────────────────────────
(v_owner, 'Shaadi Cards Mumbai',        'Invitation Cards', 'Mumbai',    '9820778901', 'Offset and digital invites. 500-card minimum. 10-day turnaround.', 3, '2025-12-08'),
(v_owner, 'Anand Printers Delhi',       'Invitation Cards', 'Delhi',     '9810001123', 'Traditional and designer invites. Box invitations and scroll rolls.', 5, '2026-01-22'),
(v_owner, 'Pixel Prints Bangalore',     'Invitation Cards', 'Bangalore', '9886667789', 'Digital + physical invites. Bilingual (English + Kannada/Tamil) printing.', 2, '2025-10-22'),
(v_owner, 'Nawab Printers Hyderabad',   'Invitation Cards', 'Hyderabad', '9948001123', 'Urdu calligraphy invites. Muslim wedding cards specialists.', 3, '2025-09-05'),
(v_owner, 'Maharaja Cards Jaipur',      'Invitation Cards', 'Jaipur',    '9414890012', 'Rajasthani folk motif and royal theme cards. Boxed invites with trinkets.', 4, '2026-02-12'),

-- ── CALLIGRAPHER ──────────────────────────────────────────────────────────────
(v_owner, 'Ink & Charm Mumbai',         'Calligrapher', 'Mumbai',    '9867112233', 'Hand-lettered invites, seating cards and favour tags. English and Hindi.', 2, '2025-11-25'),
(v_owner, 'Quill & Curve Delhi',        'Calligrapher', 'Delhi',     '9899223344', 'Devanagari and English calligraphy. Live calligraphy station at events.', 2, '2026-01-08'),
(v_owner, 'The Letter Press Bangalore', 'Calligrapher', 'Bangalore', '9886778900', 'Letterpress and calligraphy. Custom vow booklets and menu cards.', 1, '2025-09-20'),

-- ── GIFTS & FAVOURS ───────────────────────────────────────────────────────────
(v_owner, 'Wedding Favours India',      'Gifts & Favours', 'Mumbai',    '9820889012', 'Personalised mithai boxes, return gifts and welcome bags. MOQ 50 pieces.', 3, '2025-12-10'),
(v_owner, 'The Gift Studio Delhi',      'Gifts & Favours', 'Delhi',     '9810112234', 'Corporate gifting experience applied to weddings. Curated hampers.', 2, '2026-01-18'),
(v_owner, 'Giftwala Bangalore',         'Gifts & Favours', 'Bangalore', '9845889901', 'Eco-friendly favours and sapling kits. Good for conscious weddings.', 1, '2025-10-05'),

-- ── TROUSSEAU PACKING ─────────────────────────────────────────────────────────
(v_owner, 'Trousseau Tales Mumbai',     'Trousseau Packing', 'Mumbai',    '9867223345', 'Aesthetic trousseau packaging with boxes and trays. Custom name tags.', 2, '2025-12-05'),
(v_owner, 'The Bridal Box Delhi',       'Trousseau Packing', 'Delhi',     '9899334456', 'Full packaging service — attire, jewellery, cosmetics and accessories.', 3, '2026-01-15'),
(v_owner, 'Shringar Packing Jaipur',    'Trousseau Packing', 'Jaipur',    '9414001123', 'Traditional red and gold packaging. Rajasthani thaal decoration included.', 2, '2026-02-05'),

-- ── SOUND & AV ────────────────────────────────────────────────────────────────
(v_owner, 'Resonance AV Mumbai',        'Sound & AV',   'Mumbai',    '9820990012', 'Full line array sound system. LED screens and projectors. Owns own gear.', 3, '2025-12-12'),
(v_owner, 'Stage & Sound Delhi',        'Sound & AV',   'Delhi',     '9810223345', 'Concert-grade sound. Widely used for 1000+ pax sangeet events.', 4, '2026-01-25'),
(v_owner, 'Bangalore AV Solutions',     'Sound & AV',   'Bangalore', '9886890012', 'Wireless mics and full PA. Good for conference-style wedding functions.', 2, '2025-11-12'),
(v_owner, 'SoundWave Hyderabad',        'Sound & AV',   'Hyderabad', '9948112234', 'High-wattage outdoor systems. Generator backup included.', 2, '2025-09-22'),

-- ── TENT / SHAMIANA ───────────────────────────────────────────────────────────
(v_owner, 'Raj Tent House Mumbai',      'Tent / Shamiana', 'Mumbai',    '9867334456', 'AC marquee tents and traditional shamiana. Handles 200–2000 pax setups.', 3, '2025-12-08'),
(v_owner, 'Imperial Tent Delhi',        'Tent / Shamiana', 'Delhi',     '9899445567', 'Large capacity tents with flooring and lighting. 3-day setup lead time.', 4, '2026-01-20'),
(v_owner, 'Shamiana Wale Jaipur',       'Tent / Shamiana', 'Jaipur',    '9414112234', 'Traditional Rajasthani shamiana with mirror work. Desert event specialists.', 5, '2026-02-22'),
(v_owner, 'Hyderabad Tent Co',          'Tent / Shamiana', 'Hyderabad', '9948223345', 'Open ground and farmhouse setups. Generator and flooring included.', 2, '2025-08-15'),

-- ── WEDDING CAKE ──────────────────────────────────────────────────────────────
(v_owner, 'Sugar & Spice Cakes Mumbai', 'Wedding Cake', 'Mumbai',    '9820112234', 'Multi-tier fondant cakes. Indian flavours (gulab jamun, kesar) available.', 3, '2025-12-15'),
(v_owner, 'The Cake Studio Delhi',      'Wedding Cake', 'Delhi',     '9810334456', 'Designer cakes up to 10 tiers. Eggless options. 2-week advance booking.', 2, '2026-01-28'),
(v_owner, 'Bengaluru Bakes',            'Wedding Cake', 'Bangalore', '9845112234', 'Custom sculpted and floral cakes. Vegan and eggless specialisations.', 2, '2025-10-18'),
(v_owner, 'The Cake Shop Hyderabad',    'Wedding Cake', 'Hyderabad', '9948334456', 'South Indian flavours in contemporary designs. Photo cakes available.', 1, '2025-09-01');

END $$;
