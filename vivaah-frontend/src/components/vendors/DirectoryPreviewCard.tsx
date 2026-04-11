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

  const handleConfirm = () => {
    onConfirm(rate);
  };

  return (
    <div className="absolute inset-0 bg-white z-[60] flex flex-col p-4">
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-medium">{vendor.name}</h2>
            <Badge className="bg-gray-200 text-gray-800 border-gray-300">{vendor.category}</Badge>
          </div>
          
          <div className="space-y-2 text-[15px] mb-4">
            <p><span className="text-gray-500">City:</span> {vendor.city}</p>
            <p><span className="text-gray-500">Phone:</span> {vendor.phone}</p>
          </div>

          <div className="bg-white rounded-xl p-3 text-sm text-gray-600 italic border border-gray-100 mb-4">
            "{vendor.notes}"
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-vivaah-600">Used in {vendor.usedCount} weddings</span>
            <span className="text-gray-500">Last used: {vendor.lastUsedDate}</span>
          </div>
        </div>

        <div>
          <RupeeInput
            label="For reference only — enter this wedding's rate below"
            value={rate}
            onChange={setRate}
          />
          <p className="text-xs text-gray-500 mt-2">Past rates are never saved or shown</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>
          ← Back
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleConfirm}>
          Use this vendor
        </Button>
      </div>
    </div>
  );
}
