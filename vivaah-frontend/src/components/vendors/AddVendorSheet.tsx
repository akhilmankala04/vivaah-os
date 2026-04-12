import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RupeeInput } from '../ui/RupeeInput';
import { BottomSheet } from '../ui/BottomSheet';
import { CategoryDefaults } from './CategoryDefaults';
import { DirectoryPreviewCard } from './DirectoryPreviewCard';
import { supabase } from '../../lib/supabase';

export interface VendorInstance {
  id: string;
  vendor_name: string;
  category: string;
  confirmation_status: string;
  negotiated_rate?: number | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (instance: VendorInstance) => void;
  weddingId?: string; // can be passed as prop or falls back to useParams
}

export function AddVendorSheet({ isOpen, onClose, onSaved, weddingId: propWeddingId }: Props) {
  const params = useParams<{ weddingId: string }>();
  const weddingId = propWeddingId ?? params.weddingId ?? '';

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [directoryMatches, setDirectoryMatches] = useState<any[]>([]);
  const [selectedDirectoryMatch, setSelectedDirectoryMatch] = useState<any | null>(null);

  // Browse filters (shown when search is empty)
  const [browseCategory, setBrowseCategory] = useState('');
  const [browseCity, setBrowseCity] = useState('');

  // New Vendor Form State
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saveToDirectory, setSaveToDirectory] = useState(true);

  // Async state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [customCategoryError, setCustomCategoryError] = useState('');

  // Reset all form state when the sheet opens so a previously picked vendor
  // from a dismissed session does not persist into the next open.
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setBrowseCategory('');
      setBrowseCity('');
      setCategory('');
      setCustomCategory('');
      setCity('');
      setPhone('');
      setRate(null);
      setNotes('');
      setSaveToDirectory(true);
      setSelectedDirectoryMatch(null);
      setSaveError('');
      setCustomCategoryError('');
    }
  }, [isOpen]);

  // Search or browse vendor_directory (debounced 300ms)
  // When no filters are active, auto-load all recent directory vendors
  useEffect(() => {
    const isSearchMode = searchTerm.length >= 2;
    const hasBrowseFilter = browseCategory !== '' || browseCity.trim().length >= 2;

    setIsSearching(true);
    const timer = setTimeout(async () => {
      let query = supabase
        .from('vendor_directory')
        .select('id, vendor_name, category, city, phone, notes, wedding_count, last_used_date')
        .is('deleted_at', null)
        .order('wedding_count', { ascending: false })
        .limit(20);

      if (isSearchMode) {
        query = query.or(
          `vendor_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`
        );
      } else if (hasBrowseFilter) {
        if (browseCategory) query = query.eq('category', browseCategory);
        if (browseCity.trim()) query = query.ilike('city', `%${browseCity.trim()}%`);
      }
      // else: no filters — fetch all, showing full directory

      const { data } = await query;
      setDirectoryMatches(
        (data ?? []).map(d => ({
          id: d.id,
          name: d.vendor_name,
          category: d.category,
          city: d.city,
          phone: d.phone,
          notes: d.notes,
          usedCount: d.wedding_count ?? 0,
          lastUsedDate: d.last_used_date ?? '',
        }))
      );
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, browseCategory, browseCity]);

  const handleSave = async () => {
    setSaveError('');
    setCustomCategoryError('');

    const finalCategory = category === 'Custom' ? customCategory.trim() : category;

    // Validate custom category
    if (category === 'Custom' && !customCategory.trim()) {
      setCustomCategoryError('Please enter a category name');
      return;
    }

    if (!searchTerm.trim() || !finalCategory) return;

    setIsSaving(true);

    try {
      // Step 1: Create vendor_instances record
      const { data: instance, error: instanceError } = await supabase
        .from('vendor_instances')
        .insert({
          wedding_id: weddingId,
          directory_reference_id: selectedDirectoryMatch?.id ?? null,
          vendor_name: searchTerm.trim(),
          category: finalCategory,
          city: city.trim() || null,
          phone: phone.trim() || null,
          negotiated_rate: rate || null, // null if not entered; stored as paise integer
          confirmation_status: 'shortlisted',
          planner_notes: notes.trim() || null,
          deliverables: null,
        })
        .select()
        .single();

      if (instanceError || !instance) {
        throw new Error(instanceError?.message ?? 'Failed to add vendor');
      }

      // Step 2: Save to vendor_directory if requested and it's a new vendor
      if (saveToDirectory && !selectedDirectoryMatch) {
        // vendor_directory.city and .phone are NOT NULL — use empty string as default
        // owner_user_id is required by RLS and schema
        const { data: { user: dirUser } } = await supabase.auth.getUser();
        const { data: dirEntry } = await supabase
          .from('vendor_directory')
          .insert({
            owner_user_id: dirUser?.id,
            vendor_name: searchTerm.trim(),
            category: finalCategory,
            city: city.trim() || '',
            phone: phone.trim() || '',
            notes: notes.trim() || null,
          })
          .select()
          .single();

        // Link the instance to the directory entry
        if (dirEntry && instance) {
          await supabase
            .from('vendor_instances')
            .update({ directory_reference_id: dirEntry.id })
            .eq('id', instance.id);
        }
      }

      // Reset form state
      setSearchTerm('');
      setCategory('');
      setCustomCategory('');
      setCity('');
      setPhone('');
      setRate(null);
      setNotes('');
      setSaveToDirectory(true);
      setSelectedDirectoryMatch(null);

      onSaved(instance as VendorInstance);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add vendor. Please try again.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="pb-4 mb-4 border-b border-gray-100">
        <h2 className="text-xl font-medium">Add Vendor</h2>
      </div>

      {selectedDirectoryMatch && (
        <DirectoryPreviewCard
          vendor={selectedDirectoryMatch}
          onConfirm={async (finalRate) => {
            setIsSaving(true);
            setSaveError('');
            try {
              const { data: instance, error } = await supabase
                .from('vendor_instances')
                .insert({
                  wedding_id: weddingId,
                  directory_reference_id: selectedDirectoryMatch.id,
                  vendor_name: selectedDirectoryMatch.name,
                  category: selectedDirectoryMatch.category,
                  city: selectedDirectoryMatch.city || null,
                  phone: selectedDirectoryMatch.phone || null,
                  negotiated_rate: finalRate || null,
                  confirmation_status: 'shortlisted',
                  planner_notes: null,
                  deliverables: null,
                })
                .select()
                .single();

              if (error || !instance) throw new Error(error?.message ?? 'Failed to add vendor');
              onSaved(instance as VendorInstance);
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to add vendor. Please try again.';
              setSaveError(message);
            } finally {
              setIsSaving(false);
            }
          }}
          onCancel={() => setSelectedDirectoryMatch(null)}
        />
      )}

      {!selectedDirectoryMatch && (
        <>
          <Input
            label="Vendor name"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, category or city..."
          />

          {searchTerm.length === 0 && (
            <div className="mt-5 space-y-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Browse directory</span>
              <div>
                <label className="text-sm text-gray-700 block mb-1">Category</label>
                <select
                  value={browseCategory}
                  onChange={e => setBrowseCategory(e.target.value)}
                  className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-[15px] outline-none focus:border-vivaah-600 focus:ring-0"
                >
                  <option value="">All categories</option>
                  <optgroup label="Venue & Hospitality">
                    <option value="Venue">Venue</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Tent / Shamiana">Tent / Shamiana</option>
                    <option value="Catering">Catering</option>
                    <option value="Wedding Cake">Wedding Cake</option>
                  </optgroup>
                  <optgroup label="Photography & Film">
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                    <option value="Drone">Drone</option>
                    <option value="Photo Booth">Photo Booth</option>
                  </optgroup>
                  <optgroup label="Beauty & Styling">
                    <option value="Makeup">Makeup</option>
                    <option value="Hair Stylist">Hair Stylist</option>
                    <option value="Mehendi">Mehendi</option>
                    <option value="Bridal Wear">Bridal Wear</option>
                    <option value="Groom Wear">Groom Wear</option>
                    <option value="Jewellery">Jewellery</option>
                  </optgroup>
                  <optgroup label="Decor & Florals">
                    <option value="Decor">Decor</option>
                    <option value="Florist">Florist</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Rangoli Artist">Rangoli Artist</option>
                  </optgroup>
                  <optgroup label="Entertainment">
                    <option value="DJ">DJ</option>
                    <option value="Band / Baraat">Band / Baraat</option>
                    <option value="Live Music / Performer">Live Music / Performer</option>
                    <option value="Choreographer">Choreographer</option>
                    <option value="Fireworks">Fireworks</option>
                    <option value="Horse / Ghodi">Horse / Ghodi</option>
                  </optgroup>
                  <optgroup label="Coordination">
                    <option value="Event Coordinator">Event Coordinator</option>
                    <option value="Pandit / Priest">Pandit / Priest</option>
                    <option value="Astrologer / Jyotishi">Astrologer / Jyotishi</option>
                    <option value="Security">Security</option>
                    <option value="Transport">Transport</option>
                  </optgroup>
                  <optgroup label="Stationery & Gifts">
                    <option value="Invitation Cards">Invitation Cards</option>
                    <option value="Calligrapher">Calligrapher</option>
                    <option value="Gifts & Favours">Gifts & Favours</option>
                    <option value="Trousseau Packing">Trousseau Packing</option>
                  </optgroup>
                  <optgroup label="Sound & AV">
                    <option value="Sound & AV">Sound & AV</option>
                  </optgroup>
                </select>
              </div>
              <Input
                label="City"
                value={browseCity}
                onChange={e => setBrowseCity(e.target.value)}
                placeholder="e.g. Mumbai"
              />
            </div>
          )}

          {directoryMatches.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                {searchTerm.length >= 2 ? 'Directory matches' : 'Your directory'}
              </span>
              {directoryMatches.map(m => (
                <div
                  key={m.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedDirectoryMatch(m)}
                >
                  <div>
                    <div className="font-medium text-[15px]">{m.name}</div>
                    <div className="text-sm text-gray-500">{m.category} · {m.city} · Used {m.usedCount} times</div>
                  </div>
                  <span className="text-vivaah-600 text-sm font-medium">Select</span>
                </div>
              ))}
            </div>
          )}

          {searchTerm.length > 0 && directoryMatches.length === 0 && !isSearching && (
            <div className="mt-2 mb-4 text-sm font-medium text-vivaah-600">New vendor</div>
          )}

          {searchTerm.length > 0 && directoryMatches.length === 0 && (
            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => {
                    setCategory(e.target.value);
                    setCustomCategoryError('');
                  }}
                  className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-[15px] outline-none focus:border-vivaah-600 focus:ring-0"
                >
                  <option value="">Select category...</option>
                  <optgroup label="Venue & Hospitality">
                    <option value="Venue">Venue</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Tent / Shamiana">Tent / Shamiana</option>
                    <option value="Catering">Catering</option>
                    <option value="Wedding Cake">Wedding Cake</option>
                  </optgroup>
                  <optgroup label="Photography & Film">
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                    <option value="Drone">Drone</option>
                    <option value="Photo Booth">Photo Booth</option>
                  </optgroup>
                  <optgroup label="Beauty & Styling">
                    <option value="Makeup">Makeup</option>
                    <option value="Hair Stylist">Hair Stylist</option>
                    <option value="Mehendi">Mehendi</option>
                    <option value="Bridal Wear">Bridal Wear</option>
                    <option value="Groom Wear">Groom Wear</option>
                    <option value="Jewellery">Jewellery</option>
                  </optgroup>
                  <optgroup label="Decor & Florals">
                    <option value="Decor">Decor</option>
                    <option value="Florist">Florist</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Rangoli Artist">Rangoli Artist</option>
                  </optgroup>
                  <optgroup label="Entertainment">
                    <option value="DJ">DJ</option>
                    <option value="Band / Baraat">Band / Baraat</option>
                    <option value="Live Music / Performer">Live Music / Performer</option>
                    <option value="Choreographer">Choreographer</option>
                    <option value="Fireworks">Fireworks</option>
                    <option value="Horse / Ghodi">Horse / Ghodi</option>
                  </optgroup>
                  <optgroup label="Coordination">
                    <option value="Event Coordinator">Event Coordinator</option>
                    <option value="Pandit / Priest">Pandit / Priest</option>
                    <option value="Astrologer / Jyotishi">Astrologer / Jyotishi</option>
                    <option value="Security">Security</option>
                    <option value="Transport">Transport</option>
                  </optgroup>
                  <optgroup label="Stationery & Gifts">
                    <option value="Invitation Cards">Invitation Cards</option>
                    <option value="Calligrapher">Calligrapher</option>
                    <option value="Gifts & Favours">Gifts & Favours</option>
                    <option value="Trousseau Packing">Trousseau Packing</option>
                  </optgroup>
                  <optgroup label="Sound & AV">
                    <option value="Sound & AV">Sound & AV</option>
                  </optgroup>
                  <option value="Custom">Custom...</option>
                </select>
                <div className="mt-2">
                  <CategoryDefaults eventType="wedding" onSelectCategory={setCategory} />
                </div>

                {category === 'Custom' && (
                  <div className="mt-2">
                    <Input
                      label="Custom category name"
                      value={customCategory}
                      onChange={e => {
                        setCustomCategory(e.target.value);
                        if (e.target.value.trim()) setCustomCategoryError('');
                      }}
                      placeholder="e.g. Astrologer, Fireworks"
                    />
                    {customCategoryError && (
                      <p className="text-sm text-danger mt-1">{customCategoryError}</p>
                    )}
                  </div>
                )}
              </div>

              <Input label="City" value={city} onChange={e => setCity(e.target.value)} />
              <Input label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />

              <RupeeInput
                label="Negotiated rate"
                value={rate}
                onChange={setRate}
              />

              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-vivaah-600 focus:ring-vivaah-600 w-5 h-5 accent-vivaah-600"
                    checked={saveToDirectory}
                    onChange={e => setSaveToDirectory(e.target.checked)}
                  />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-gray-800">Save to my vendor directory</span>
                    <span className="text-xs text-gray-500">Saved vendors can be added to future weddings in one tap.</span>
                  </div>
                </label>
              </div>

              {saveError && (
                <p className="text-sm text-danger mt-1">{saveError}</p>
              )}

              <Button
                variant="primary"
                className="w-full"
                disabled={isSaving || !category}
                onClick={handleSave}
              >
                {isSaving ? 'Adding…' : 'Add vendor'}
              </Button>
            </div>
          )}
        </>
      )}
    </BottomSheet>
  );
}
