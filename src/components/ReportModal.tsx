import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  AlertCircle, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Tag, 
  Clock, 
  Lock 
} from 'lucide-react';
import { ItemType, CategoryType, LocationType, User } from '../types';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../data/initialData';

interface ReportModalProps {
  initialType?: ItemType;
  currentUser: User;
  onClose: () => void;
  onSubmit: (itemData: any) => void;
}

// Sample presets for quick testing image uploads
const SAMPLE_PRESET_IMAGES = [
  { name: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&q=80&w=800' },
  { name: 'ID Card / Lanyard', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800' },
  { name: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800' },
  { name: 'Earbuds Case', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800' },
  { name: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800' },
  { name: 'Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=800' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  initialType = 'Lost',
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationType>('Academic Block');
  const [roomDetails, setRoomDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('02:00 PM');
  const [color, setColor] = useState('');
  const [identifyingDetails, setIdentifyingDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  // Handle local image file upload converting to Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide an item name and description.');
      return;
    }

    onSubmit({
      title,
      type,
      category,
      description,
      location,
      roomDetails,
      date,
      time,
      color,
      identifyingDetails,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800',
      userId: currentUser.id,
      userRegNumber: currentUser.regNumber,
      userName: currentUser.name,
      userBranch: currentUser.branch,
      userYear: currentUser.year,
      userPhone: currentUser.phone,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-orange-100 rounded-3xl max-w-2xl w-full my-8 p-6 shadow-2xl relative text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Lost vs Found Toggle */}
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900 mb-1">
            {type === 'Lost' ? '🔴 Report a Lost Item' : '🟢 Report a Found Item'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Post an item report to notify students and enable smart matching across campus.
          </p>

          {/* Toggle Pills */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-orange-50/80 p-1 rounded-2xl border border-orange-200">
            <button
              type="button"
              onClick={() => setType('Lost')}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                type === 'Lost'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔴 I LOST SOMETHING
            </button>
            <button
              type="button"
              onClick={() => setType('Found')}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                type === 'Found'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 I FOUND SOMETHING
            </button>
          </div>
        </div>

        {/* Privacy Notice Banner */}
        {type === 'Found' && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 font-bold">Privacy Safeguard:</strong> Never post full sensitive details like full ID Card numbers publicly. Keep some identifying features in secret notes for claim verification!
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Item Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio Scientific Calculator FX-991EX"
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
              Public Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item appearance, brand, condition, or stickers..."
              className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* Location & Room Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as LocationType)}
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Specific Room / Spot Details
              </label>
              <input
                type="text"
                value={roomDetails}
                onChange={(e) => setRoomDetails(e.target.value)}
                placeholder="e.g. Room 204, Table 14, Desk near window"
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Date, Time, Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Date {type === 'Lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Approx Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 02:30 PM"
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                Item Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Black, Blue, Silver"
                className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Secret Identifying Detail */}
          <div className="p-3.5 bg-orange-50/70 rounded-2xl border border-orange-200">
            <label className="block font-black text-orange-600 mb-1 flex items-center space-x-1.5 uppercase text-[10px] tracking-wide">
              <Lock className="w-3.5 h-3.5 text-orange-500" />
              <span>Private / Secret Identifying Details (Optional)</span>
            </label>
            <input
              type="text"
              value={identifyingDetails}
              onChange={(e) => setIdentifyingDetails(e.target.value)}
              placeholder="e.g. Small scratch near battery lid, initials written inside, specific key ribbon"
              className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              Used during verification to ensure only the true owner claims this item.
            </p>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
              Item Photograph Upload
            </label>
            
            {/* Custom Drag & Drop / File Input */}
            <div className="border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-2xl p-4 text-center bg-orange-50/50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">
                Click or drag & drop item photo here
              </p>
              <p className="text-[10px] text-slate-500 font-medium">PNG, JPG or WebP up to 5MB</p>
            </div>

            {/* Quick Sample Presets */}
            <div className="mt-2">
              <p className="text-[10px] font-bold text-slate-500 mb-1">Or choose a quick demo image preset:</p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      imageUrl === preset.url
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                    }`}
                  >
                    📷 {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded Preview */}
            {imageUrl && (
              <div className="mt-3 relative w-32 h-24 rounded-xl overflow-hidden border border-orange-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-0.5 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-orange-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center space-x-1.5 uppercase tracking-wider ${
                type === 'Lost'
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-100'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{type === 'Lost' ? 'POST LOST ITEM REPORT' : 'POST FOUND ITEM REPORT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
