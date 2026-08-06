import React from 'react';
import { Award, ShieldCheck, Medal, Crown, Heart, Sparkles } from 'lucide-react';
import { Item } from '../types';
import { calculateUserSamaritanStats } from '../utils/achievements';

interface GoodSamaritanBadgePillProps {
  user: {
    id: string;
    regNumber: string;
    name: string;
    branch?: string;
    year?: string;
    phone?: string;
  };
  items: Item[];
  size?: 'sm' | 'md' | 'lg';
  showKarma?: boolean;
  className?: string;
  onClick?: () => void;
}

export const GoodSamaritanBadgePill: React.FC<GoodSamaritanBadgePillProps> = ({
  user,
  items,
  size = 'md',
  showKarma = false,
  className = '',
  onClick,
}) => {
  const stats = calculateUserSamaritanStats(user, items);
  const badge = stats.currentBadge;

  // Don't render generic Novice pill unless requested, or render a simple subtle badge
  const renderIcon = () => {
    switch (badge.iconName) {
      case 'Award':
        return <Award className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />;
      case 'ShieldCheck':
        return <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />;
      case 'Medal':
        return <Medal className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />;
      case 'Crown':
        return <Crown className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />;
      default:
        return <Heart className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />;
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 space-x-1',
    md: 'text-xs px-2 py-0.5 space-x-1.5',
    lg: 'text-sm px-3 py-1 space-x-2',
  };

  if (badge.tier === 'Novice') {
    return (
      <span
        onClick={onClick}
        title="Campus Citizen (0 items helped yet)"
        className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-semibold ${sizeClasses[size]} ${
          onClick ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''
        } ${className}`}
      >
        <span>🌱</span>
        <span>Campus Citizen</span>
      </span>
    );
  }

  return (
    <span
      onClick={onClick}
      title={`${badge.title}: ${stats.totalHelps} items helped return • ${stats.karmaPoints} Karma Points`}
      className={`inline-flex items-center rounded-full border ${badge.pillBg} ${badge.pillText} ${sizeClasses[size]} ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      <span className="shrink-0">{badge.badgeEmoji}</span>
      <span className="font-extrabold flex items-center space-x-1">
        <span>{badge.tier} Samaritan</span>
        {stats.totalHelps > 0 && <span className="opacity-80 font-mono text-[0.9em]">({stats.totalHelps})</span>}
      </span>
      {showKarma && (
        <span className="inline-flex items-center space-x-0.5 bg-black/10 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>{stats.karmaPoints}</span>
        </span>
      )}
    </span>
  );
};
