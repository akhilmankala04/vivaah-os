# S29 - India Vendor Category Defaults Taxonomy Handoff

This document provides the necessary configuration rules and dataset for the S29 India-specific vendor categories. It is intended for consumption by the Schema Agent and Frontend Agent.

## Category Validation List

Write operations on `vendor_directory` and `vendor_instances` should validate that the `category` field matches one of these values OR the vendor record is explicitly marked with `is_custom = true`. 

### Flat List of Valid Categories
1. Baraat — band / DJ
2. Caterer
3. Caterer — snacks and beverages
4. Décor
5. DJ / live music
6. Florist
7. Lighting
8. Makeup artist
9. Makeup artist — bride
10. Makeup artist — groom / groomsmen
11. Mehendi artist
12. Photographer
13. Priest / pandit
14. Venue
15. Videographer

*(Note: "Officiant", "Processional music", "Henna artist", and "Catering company" are strictly forbidden. All names above comply with Indian naming rules).*

## Custom Category Persistence Rule (For Frontend Agent)

When a user adds a custom category (one not listed in the defaults list above):

1. **Storage**: It must be saved as a free-text category string directly on the `VendorInstance` record.
2. **Contextual Autocomplete**: It MUST be presented as an option in the category selector for any subsequent vendors added to the **same wedding**.
3. **Isolation Rule 1 (No Platform Pollution)**: It MUST NOT be saved to the platform defaults list (`event_category_defaults` table).
4. **Isolation Rule 2 (No Cross-Wedding Contamination)**: It MUST NOT be saved across different weddings. Even if the same user plans a second wedding, the custom category does not carry over.

## Implementation Details
The base configuration table `event_category_defaults` has been seeded and is retrievable via the Supabase Edge Function `get_event_category_defaults`. Ensure you pass the `event_type` parameter to retrieve the ordered list specific to an event.
