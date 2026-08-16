import React, { useState } from 'react';
import {
  X,
  Upload,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Lock,
  RefreshCw,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { ItemType, CategoryType, LocationType, User, Item } from '../types';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../data/initialData';
import { performImageAutoFill, generateAIDescription } from '../utils/ai';
import { generateCampusItemCode } from '../utils/storage';

interface ReportModalProps {
  initialType?: ItemType;
  currentUser: User;
  existingItems?: Item[];
  onClose: () => void;
  onSubmit: (itemData: any) => void;
}

// Sample presets for quick testing image uploads
const SAMPLE_PRESET_IMAGES = [
  {
    name: 'Casio Calculator',
    category: 'Electronics' as CategoryType,
    color: 'Black',
    brand: 'Casio',
    url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'ID Card / Lanyard',
    category: 'ID Cards' as CategoryType,
    color: 'Blue / White',
    brand: 'Campus ID',
    url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Wildcraft Backpack',
    category: 'Bags' as CategoryType,
    color: 'Navy Blue',
    brand: 'Wildcraft',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Leather Wallet',
    category: 'Wallet' as CategoryType,
    color: 'Brown',
    brand: 'Titan',
    url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Keys & Keychain',
    category: 'Keys' as CategoryType,
    color: 'Silver / Red Ring',
    brand: 'Honda',
    url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=800',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  initialType = 'Lost',
  currentUser,
  existingItems = [],
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Electronics');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationType>('Central Library');
  const [customLocation, setCustomLocation] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('02:00 PM');
  const [color, setColor] = useState('');
  const [identifyingDetails, setIdentifyingDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [visualTags, setVisualTags] = useState<string[]>([]);
  const [storageLocation, setStorageLocation] = useState('Security Desk Locker #B-14');
  const [isAIAutoFilling, setIsAIAutoFilling] = useState(false);
  const [isAIGeneratingDesc, setIsAIGeneratingDesc] = useState(false);
  const [error, setError] = useState('');

  // AI Visual Auto-Fill trigger
  const handleRunAIAutoFill = async (imgSource: string) => {
    setIsAIAutoFilling(true);
    setError('');
    try {
      const data = await performImageAutoFill(imgSource);
      if (data.title) setTitle(data.title);
      if (data.category) setCategory(data.category);
      if (data.color) setColor(data.color);
      if (data.brand) setBrand(data.brand);
      if (data.description) setDescription(data.description);
      if (data.tags) setVisualTags(data.tags);
      if (data.secretIdentifyingDetailsHint && !identifyingDetails) {
        setIdentifyingDetails(data.secretIdentifyingDetailsHint);
      }
    } catch (err) {
      console.error('AI Auto-Fill error:', err);
    } finally {
      setIsAIAutoFilling(false);
    }
  };

  // AI Description Generator trigger
  const handleGenerateAIDesc = async () => {
    if (!title.trim()) {
      setError('Please provide at least an Item Name first.');
      return;
    }
    setIsAIGeneratingDesc(true);
    try {
      const result = await generateAIDescription({
        title,
        category,
        location,
        color,
        type,
      });
      if (result.description) {
        setDescription(result.description);
      }
      if (result.tags && result.tags.length > 0) {
        setVisualTags((prev) => Array.from(new Set([...prev, ...result.tags])));
      }
    } catch (e) {
      console.error('Description gen error:', e);
    } finally {
      setIsAIGeneratingDesc(false);
    }
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        handleRunAIAutoFill(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check for potential duplicate reports
  const potentialDuplicates = existingItems.filter(
    (item) =>
      item.type === type &&
      item.category === category &&
      item.location === location &&
      item.status === 'Pending'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide an item name and description.');
      return;
    }

    const isCustom = location === 'Custom Location' || location === 'Other Campus Area';
    if (isCustom && !customLocation.trim()) {
      setError('Please enter your specific custom location name.');
      return;
    }

    const finalLocation = isCustom && customLocation.trim() ? customLocation.trim() : location;
    const itemCode = generateCampusItemCode(type);

    onSubmit({
      itemCode,
      title,
      type,
      category,
      brand,
      description,
      location: finalLocation,
      roomDetails,
      date,
      time,
      color,
      identifyingDetails,
      storageLocation: type === 'Found' ? storageLocation : undefined,
      visualTags,
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800',
      userId: currentUser.id,
      userRegNumber: currentUser.regNumber,
      userName: currentUser.name,
      userBranch: currentUser.branch,
      userYear: currentUser.year,
      userPhone: currentUser.phone,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-2xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Sticky Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug flex items-center space-x-2">
              <span>{type === 'Lost' ? '🔴 Report a Lost Item' : '🟢 Report a Found Item'}</span>
              <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                Smart Form v2.4
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
              Post an item report to enable AI matching, geofenced campus alerts, and digital custody tracking.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form wrapping body and sticky footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Toggle Pills */}
            <div className="grid grid-cols-2 gap-2 bg-orange-50/80 p-1 rounded-2xl border border-orange-200">
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
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🟢 I FOUND SOMETHING
              </button>
            </div>

            {/* AI Image Upload & Auto-Fill Section (Tier 1 #2) */}
            <div className="p-4 bg-gradient-to-br from-orange-50/80 via-amber-50/60 to-white rounded-2xl border-2 border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider text-orange-950 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>AI Photo Auto-Tag & Auto-Fill</span>
                </span>
                <span className="text-[10px] bg-orange-200/70 text-orange-900 px-2 py-0.5 rounded-full font-bold">
                  Vision Powered
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-xl p-3 text-center bg-white/80 relative transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">
                  Upload item photograph for Instant AI Auto-Fill
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG up to 5MB</p>
              </div>

              {/* Preset Sample Buttons */}
              <div>
                <p className="text-[10px] font-bold text-slate-600 mb-1">
                  Or test with sample campus photo preset:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setTitle(preset.name);
                        setCategory(preset.category);
                        setColor(preset.color);
                        setBrand(preset.brand);
                        handleRunAIAutoFill(preset.url);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white hover:bg-orange-100 text-orange-900 border border-orange-200 transition-all shadow-2xs"
                    >
                      📷 {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Auto-Fill Loading Spinner */}
              {isAIAutoFilling && (
                <div className="p-2 bg-orange-100 text-orange-900 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                  <span>AI analyzing image tags, category, and visual attributes...</span>
                </div>
              )}
            </div>

            {/* AI Duplicate Detection Warning Banner */}
            {potentialDuplicates.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-black text-amber-950">
                    AI Duplicate Radar ({potentialDuplicates.length} Similar Active Cases):
                  </strong>{' '}
                  Another {type.toLowerCase()} item in <span className="font-bold">{location}</span> ({category}) was reported recently. Check existing items before submitting!
                </div>
              </div>
            )}

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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                  Brand / Make
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Casio, Wildcraft, Dell, Apple"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  placeholder="e.g. Black, Navy Blue, Silver"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Description + AI Assistant Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide">
                  Public Description <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAIDesc}
                  disabled={isAIGeneratingDesc}
                  className="text-[11px] font-bold text-orange-700 hover:text-orange-900 flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isAIGeneratingDesc ? 'Writing...' : '✨ Generate Professional Description with AI'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe condition, location circumstances, or markings..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Campus Location & Spot Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                  Campus Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as LocationType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  Specific Room / Spot
                </label>
                <input
                  type="text"
                  value={roomDetails}
                  onChange={(e) => setRoomDetails(e.target.value)}
                  placeholder="e.g. Reading Hall 2, Table 14"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                  Date {type === 'Lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Private Identifying Details */}
            <div className="p-3.5 bg-orange-50/80 rounded-2xl border border-orange-200 space-y-1">
              <label className="block font-black text-orange-950 flex items-center space-x-1.5 uppercase text-[10px] tracking-wide">
                <Lock className="w-3.5 h-3.5 text-orange-600" />
                <span>Private / Secret Identifying Details</span>
              </label>
              <input
                type="text"
                value={identifyingDetails}
                onChange={(e) => setIdentifyingDetails(e.target.value)}
                placeholder="e.g. Silver NASA sticker on back lid, initials 'DR' etched on bottom"
                className="w-full bg-white border border-orange-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-[10px] text-slate-500">
                Hidden from public cards. Used to challenge claimants during verification.
              </p>
            </div>

            {/* Storage Locker Assignment for Found Items */}
            {type === 'Found' && (
              <div>
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                  Physical Storage Locker / Deposit Location
                </label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="e.g. Admin Security Desk Locker #B-14, Dept Office Box #2"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="px-5 py-3.5 border-t border-orange-100 flex items-center justify-end space-x-3 shrink-0 bg-slate-50/90 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center space-x-1.5 uppercase tracking-wider ${
                type === 'Lost'
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{type === 'Lost' ? 'POST LOST REPORT' : 'POST FOUND INVENTORY'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
