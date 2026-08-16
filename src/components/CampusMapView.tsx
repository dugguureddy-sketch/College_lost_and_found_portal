import React, { useState } from 'react';
import { Item, LocationType } from '../types';
import { CAMPUS_ZONES } from '../data/initialData';
import { MapPin, Flame, Shield, Search, Eye, Filter, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CampusMapViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  onFilterByLocation?: (location: LocationType) => void;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  items,
  onSelectItem,
  onFilterByLocation,
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>('Central Library');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapFilter, setMapFilter] = useState<'All' | 'Lost' | 'Found'>('All');
  const recentFoundItem = items.find((i) => i.type === 'Found' && i.status === 'Pending');
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const showProximityAlert = !dismissedAlert && !!recentFoundItem;

  // Group items by campus location
  const getItemsForZone = (zoneName: string) => {
    return items.filter((item) => {
      const match = item.location === zoneName;
      if (!match) return false;
      if (mapFilter === 'All') return true;
      return item.type === mapFilter;
    });
  };

  const activeZoneData = CAMPUS_ZONES.find((z) => z.name === selectedZone) || CAMPUS_ZONES[0];
  const activeZoneItems = getItemsForZone(activeZoneData.name);

  const totalLostCount = items.filter((i) => i.type === 'Lost' && i.status === 'Pending').length;
  const totalFoundCount = items.filter((i) => i.type === 'Found' && i.status === 'Pending').length;

  return (
    <div className="bg-white border-2 border-orange-200 rounded-3xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Top Header & Map Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Interactive Campus Recovery Map
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time visual map of lost items, found drop-off desks, security lockers, and incident hotspots.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
              showHeatmap
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-rose-500 fill-rose-500' : ''}`} />
            <span>{showHeatmap ? 'Heatmap: Active' : 'Heatmap: Off'}</span>
          </button>

          {/* Lost / Found Filter */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
            {(['All', 'Lost', 'Found'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setMapFilter(f)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  mapFilter === f
                    ? f === 'Lost'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : f === 'Found'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Proximity Real-Time Alert Banner */}
      {showProximityAlert && recentFoundItem && (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-slate-800 animate-fade-in">
          <div className="flex items-start space-x-3">
            <span className="p-1.5 bg-orange-500 text-white rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-200/80 px-2 py-0.5 rounded-md">
                  Location Proximity Alert
                </span>
                <span className="text-xs text-slate-500">Live Campus Geofence</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
                A newly reported <strong className="text-slate-900">{recentFoundItem.title}</strong> was dropped off at <span className="font-semibold text-orange-900">{recentFoundItem.location}</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissedAlert(true)}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 shrink-0 px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Map Layout Grid: Left Interactive Stage + Right Zone Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Campus Canvas */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-4 sm:p-6 relative overflow-hidden border border-slate-800 shadow-inner min-h-[380px] sm:min-h-[460px] flex flex-col justify-between">
          {/* Subtle Grid Lines Overlay */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#fb923c 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0, 16px 16px',
            }}
          />

          {/* Map Top Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-xs px-3 py-2 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Lost Pin ({totalLostCount})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Found / Drop Desk ({totalFoundCount})</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              CAMPUS GPS GRID v2.4 • 9 ZONES
            </span>
          </div>

          {/* Campus Map Nodes & Hotspots */}
          <div className="relative w-full h-[320px] sm:h-[360px] my-auto">
            {CAMPUS_ZONES.map((zone) => {
              const zoneItems = getItemsForZone(zone.name);
              const lostInZone = zoneItems.filter((i) => i.type === 'Lost').length;
              const foundInZone = zoneItems.filter((i) => i.type === 'Found').length;
              const isSelected = selectedZone === zone.name;

              // Heatmap color intensity
              const isHighHeat = zone.hotspotLevel === 'High' && showHeatmap;
              const isMedHeat = zone.hotspotLevel === 'Medium' && showHeatmap;

              return (
                <button
                  key={zone.name}
                  onClick={() => setSelectedZone(zone.name)}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-20 transition-all duration-300 group flex flex-col items-center focus:outline-none`}
                >
                  {/* Heatmap Glow Effect */}
                  {showHeatmap && (
                    <span
                      className={`absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full -z-10 pointer-events-none transition-all ${
                        isHighHeat
                          ? 'bg-rose-500/30 blur-md animate-pulse'
                          : isMedHeat
                          ? 'bg-amber-500/20 blur-md'
                          : 'bg-emerald-500/10 blur-sm'
                      }`}
                    />
                  )}

                  {/* Node Pin Marker */}
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-lg border-2 ${
                      isSelected
                        ? 'bg-orange-500 text-white border-white scale-110 ring-4 ring-orange-500/40'
                        : isHighHeat
                        ? 'bg-slate-900 text-rose-400 border-rose-500 hover:scale-105'
                        : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-orange-400 hover:scale-105'
                    }`}
                  >
                    {zone.name.includes('Library') ? (
                      '📚'
                    ) : zone.name.includes('Admin') ? (
                      '🛡️'
                    ) : zone.name.includes('Canteen') ? (
                      '☕'
                    ) : zone.name.includes('Hostel') ? (
                      '🛏️'
                    ) : zone.name.includes('Sports') ? (
                      '⚽'
                    ) : (
                      '🏫'
                    )}
                  </div>

                  {/* Zone Label & Live Count Badges */}
                  <div className="mt-1.5 flex flex-col items-center">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap border transition-all ${
                        isSelected
                          ? 'bg-orange-600 text-white border-orange-400 shadow-xs'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 group-hover:border-slate-500'
                      }`}
                    >
                      {zone.shortName}
                    </span>

                    {/* Counts indicator */}
                    {(lostInZone > 0 || foundInZone > 0) && (
                      <div className="flex items-center space-x-1 mt-0.5">
                        {lostInZone > 0 && (
                          <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-sm">
                            {lostInZone}L
                          </span>
                        )}
                        {foundInZone > 0 && (
                          <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1 rounded-sm">
                            {foundInZone}F
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map Footer Helper */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <span>Click any campus building to inspect active reports</span>
            <span>📍 Security HQ / Locker Desk: Admin Block</span>
          </div>
        </div>

        {/* Right Panel: Selected Zone Details & Items List */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-orange-50/70 border-2 border-orange-200 rounded-3xl p-5 space-y-4 flex-1">
            {/* Zone Title Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                  Zone Details
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    activeZoneData.hotspotLevel === 'High'
                      ? 'bg-rose-100 text-rose-700'
                      : activeZoneData.hotspotLevel === 'Medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {activeZoneData.hotspotLevel} Activity
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {activeZoneData.name}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeZoneData.description}
              </p>
            </div>

            {/* Zone Statistics Pills */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-2xl border border-orange-100 shadow-2xs">
                <span className="text-xs text-slate-500 block font-medium">Lost Reports</span>
                <span className="text-base font-black text-amber-600">
                  {activeZoneItems.filter((i) => i.type === 'Lost').length}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-orange-100 shadow-2xs">
                <span className="text-xs text-slate-500 block font-medium">Found Items</span>
                <span className="text-base font-black text-emerald-600">
                  {activeZoneItems.filter((i) => i.type === 'Found').length}
                </span>
              </div>
            </div>

            {/* List of Items in this Zone */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                Active Items in Zone ({activeZoneItems.length})
              </span>

              {activeZoneItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-4 text-center border border-dashed border-orange-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700">No active incidents</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This campus zone currently has 0 unresolved lost/found reports.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {activeZoneItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="bg-white p-3 rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                              item.type === 'Lost'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.itemCode || item.date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          📍 {item.roomDetails || item.location}
                        </p>
                      </div>

                      <button className="p-1.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Filter Action */}
            {onFilterByLocation && (
              <button
                onClick={() => onFilterByLocation(activeZoneData.name)}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Filter Main Feed by {activeZoneData.shortName}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
