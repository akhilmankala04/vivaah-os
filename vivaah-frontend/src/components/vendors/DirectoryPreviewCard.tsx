import { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { RupeeInput } from '../ui/RupeeInput';

interface DirectoryVendor {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  notes: string;
  usedCount: number;
  lastUsedDate: string;
}

interface Props {
  vendor: DirectoryVendor;
  onConfirm: (rate: number | null) => void;
  onCancel: () => void;
}

export function DirectoryPreviewCard({ vendor, onConfirm, onCancel }: Props) {
  const [rate, setRate] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {/* Scrollable content */}
      <div className="space-y-5 pb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-medium">{vendor.name}</h2>
            <Badge className="bg-gray-200 text-gray-800 border-gray-300">{vendor.category}</Badge>
          </div>

          <div className="space-y-1.5 text-[15px] mb-4">
            {vendor.city && <p><span className="text-gray-500">City: </span>{vendor.city}</p>}
            {vendor.phone && <p><span className="text-gray-500">Phone: </span>{vendor.phone}</p>}
          </div>

          {vendor.notes && (
            <div className="bg-white rounded-xl p-3 text-sm text-gray-600 italic border border-gray-100 mb-3">
              "{vendor.notes}"
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-vivaah-600">Used in {vendor.usedCount} wedding{vendor.usedCount !== 1 ? 's' : ''}</span>
            {vendor.lastUsedDate && (
              <span className="text-gray-500">Last used: {vendor.lastUsedDate}</span>
            )}
          </div>
        </div>

        <div>
          <RupeeInput
            label="Negotiated rate for this wedding"
            value={rate}
            onChange={setRate}
          />
          <p className="text-xs text-gray-500 mt-1">Past rates from other weddings are never shown here.</p>
        </div>
      </div>

      {/* Action buttons — sticky to bottom of the sheet scroll container */}
      <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-gray-100 flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>
          ← Back
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => onConfirm(rate)}>
          Use this vendor
        </Button>
      </div>
    </div>
  );
}
