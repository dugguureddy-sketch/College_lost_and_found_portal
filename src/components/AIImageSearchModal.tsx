import React, { useState } from 'react';
import { Item, CategoryType } from '../types';
import { performImageAutoFill } from '../utils/ai';
import { calculateVisualSearchMatch } from '../utils/matching';
import { Camera, Upload, Sparkles, X, ArrowRight, CheckCircle, Search, RefreshCw, Layers } from 'lucide-react';

interface AIImageSearchModalProps {
  items: Item[];
  onClose: () => void;
  onSelectItem: (item: Item) => void;
}

const PRESET_DEMO_IMAGES = [
  {
    label: 'Casio Scientific Calculator',
    category: 'Electronics' as CategoryType,
    color: 'Black',
    tags: ['calculator', 'casio', 'scientific-device', 'black'],
    imgUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Wildcraft Backpack',
    category: 'Bags' as CategoryType,
    color: 'Navy Blue',
    tags: ['backpack', 'wildcraft', 'navy-blue', 'bag'],
    imgUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'College ID Card & Lanyard',
    category: 'ID Cards' as CategoryType,
    color: 'White / Blue Lanyard',
    tags: ['id-card', 'lanyard', 'student-id'],
    imgUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Leather Bifold Wallet',
    category: 'Wallet' as CategoryType,
    color: 'Brown / Black',
    tags: ['wallet', 'leather', 'purse'],
    imgUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=80',
  },
];

export const AIImageSearchModal: React.FC<AIImageSearchModalProps> = ({
  items,
  onClose,
  onSelectItem,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(PRESET_DEMO_IMAGES[0].imgUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string>(PRESET_DEMO_IMAGES[0].category);
  const [detectedColor, setDetectedColor] = useState<string>(PRESET_DEMO_IMAGES[0].color);
  const [detectedTags, setDetectedTags] = useState<string[]>(PRESET_DEMO_IMAGES[0].tags);
  const [matchedResults, setMatchedResults] = useState<{ item: Item; similarity: number }[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      runVisionAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_DEMO_IMAGES[0]) => {
    setSelectedImage(preset.imgUrl);
    setDetectedCategory(preset.category);
    setDetectedColor(preset.color);
    setDetectedTags(preset.tags);
    runSearchOnTags(preset.category, preset.color, preset.tags);
  };

  const runVisionAnalysis = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await performImageAutoFill(imageBase64);
      setDetectedCategory(analysis.category);
      setDetectedColor(analysis.color);
      setDetectedTags(analysis.tags || [analysis.category.toLowerCase()]);

      runSearchOnTags(analysis.category, analysis.color, analysis.tags || []);
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runSearchOnTags = (category: string, color: string, tags: string[]) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Filter Found items in database
      const foundCandidates = items.filter((i) => i.type === 'Found' && i.status !== 'Found');

      const scored = foundCandidates.map((item) => {
        const similarity = calculateVisualSearchMatch(tags, category, color, item);
        return { item, similarity };
      });

      scored.sort((a, b) => b.similarity - a.similarity);
      setMatchedResults(scored);
      setHasSearched(true);
      setIsAnalyzing(false);
    }, 400);
  };

  // Run initial search on mount
  React.useEffect(() => {
    runSearchOnTags(PRESET_DEMO_IMAGES[0].category, PRESET_DEMO_IMAGES[0].color, PRESET_DEMO_IMAGES[0].tags);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-3xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>AI Vision Image Search</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  Gemini Vision
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Upload a photo of your lost item — AI visual embeddings scan all campus found inventory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Demo Image Presets & Upload Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left: Active Upload / Photo Preview */}
            <div className="md:col-span-5 flex flex-col space-y-3">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Target Image
              </span>

              <div className="bg-slate-900 rounded-2xl p-2 border border-slate-800 relative h-48 sm:h-52 flex items-center justify-center overflow-hidden group">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Query Image"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">No Image Selected</p>
                  </div>
                )}

                {/* Overlay Scanning Effect */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-orange-500/20 backdrop-blur-2xs flex flex-col items-center justify-center text-white">
                    <RefreshCw className="w-6 h-6 animate-spin mb-1 text-orange-300" />
                    <span className="text-xs font-black tracking-wider uppercase bg-slate-950/80 px-2.5 py-1 rounded-md">
                      Analyzing Visual Embeddings...
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Input Button */}
              <label className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-dashed border-orange-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Custom Item Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Right: Quick Demo Image Selector & Extracted Tags */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                  Or Test with Sample Campus Photos
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_DEMO_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-xl text-left border transition-all flex items-center space-x-2 ${
                        selectedImage === preset.imgUrl
                          ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <img
                        src={preset.imgUrl}
                        alt={preset.label}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-slate-900">{preset.label}</p>
                        <p className="text-[10px] text-slate-500">{preset.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Vision Extracted Metadata */}
              <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-3 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-700 block">
                  AI Extracted Visual Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs bg-white text-slate-800 font-bold px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
                    📁 {detectedCategory}
                  </span>
                  <span className="text-xs bg-white text-slate-800 font-bold px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
                    🎨 {detectedColor}
                  </span>
                  {detectedTags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-orange-100 text-orange-800 font-medium px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Search Match Results */}
          <div className="space-y-3 pt-2 border-t border-orange-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-orange-600" />
                <span>Found Items Ranked by Visual Similarity ({matchedResults.length})</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">Sorted by AI Vision Match %</span>
            </div>

            {matchedResults.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600">No visually matching items found in the current inventory.</p>
                <p className="text-[11px] text-slate-400 mt-1">Try uploading another angle or checking standard filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedResults.map(({ item, similarity }) => (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-orange-100 hover:border-orange-300 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            similarity >= 80
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : similarity >= 50
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {similarity}% Visual Match
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.itemCode || item.date}
                        </span>
                      </div>

                      <h5 className="text-sm font-black text-slate-900 line-clamp-1">{item.title}</h5>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-600 mt-2">
                        <span>📍 {item.location}</span>
                        <span>•</span>
                        <span>🎨 {item.color || 'Standard'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectItem(item);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                    >
                      <span>Inspect Match & Claim</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-orange-100 bg-slate-50 rounded-b-3xl flex items-center justify-between text-xs text-slate-500">
          <span>🔒 Photos securely processed on server</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
