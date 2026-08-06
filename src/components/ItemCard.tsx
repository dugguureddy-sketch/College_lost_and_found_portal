import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Tag, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight,
  PhoneCall,
  UserCheck,
  QrCode
} from 'lucide-react';
import { Item } from '../types';
import { GoodSamaritanBadgePill } from './GoodSamaritanBadgePill';
import { getItems } from '../utils/storage';

interface ItemCardProps {
  item: Item;
  allItems?: Item[];
  onViewDetails: (item: Item) => void;
  onOpenQRCode?: (item: Item) => void;
  matchScore?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, allItems, onViewDetails, onOpenQRCode, matchScore }) => {
  const getStatusBadge = () => {
    switch (item.status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>PENDING</span>
          </span>
        );
      case 'Recovered':
        return (
          <span className="inline-flex items-center space-x-1 bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>RECOVERED</span>
          </span>
        );
      case 'Found':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>CLOSED & RETURNED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(item)}
      className="group bg-white rounded-3xl p-4 border border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative w-full h-44 bg-slate-100 rounded-2xl overflow-hidden mb-3">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50/50 text-slate-400 font-medium">
            <Tag className="w-8 h-8 mb-1 text-orange-300" />
            <span className="text-xs">No Photograph Uploaded</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Lost vs Found Pill */}
          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-black shadow-sm ${
            item.type === 'Lost'
              ? 'bg-rose-500 text-white'
              : 'bg-emerald-500 text-white'
          }`}>
            <span>{item.type === 'Lost' ? '🔴 LOST' : '🟢 FOUND'}</span>
          </span>

          {/* Status Badge */}
          {getStatusBadge()}
        </div>

        {/* Smart Match Score Badge Overlay */}
        {matchScore !== undefined && matchScore >= 40 && (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-900 text-amber-300 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-black flex items-center space-x-1 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{matchScore}% Match Score</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold text-orange-500 flex items-center space-x-1">
              <Tag className="w-3 h-3" />
              <span>{item.category}</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{item.date}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-black text-slate-800 group-hover:text-orange-500 transition-colors line-clamp-1 mb-1">
            {item.title}
          </h3>

          {/* Location details */}
          <div className="flex items-start space-x-1.5 text-xs text-slate-600 mb-2 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {item.location} {item.roomDetails ? `• ${item.roomDetails}` : ''}
            </span>
          </div>

          {/* Description Snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-bold overflow-hidden">
            <GoodSamaritanBadgePill
              user={{
                id: item.userId,
                regNumber: item.userRegNumber,
                name: item.userName,
                branch: item.userBranch,
                year: item.userYear,
                phone: item.userPhone,
              }}
              items={allItems || getItems()}
              size="sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            {onOpenQRCode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenQRCode(item);
                }}
                title="Get QR Code & Campus Printable Poster"
                className="p-1.5 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors flex items-center space-x-1 text-[11px] font-bold"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(item);
              }}
              className="text-xs font-black text-orange-500 hover:text-orange-600 flex items-center space-x-1 uppercase tracking-wider"
            >
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
