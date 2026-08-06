import React, { useState, useRef, useEffect } from 'react';
import { Bell, GripHorizontal, PlusCircle, X, MapPin, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Radio, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Item, ItemType } from '../types';

interface MovableNotificationProps {
  items: Item[];
  onViewItemDetails?: (item: Item) => void;
  onOpenReportModal?: (type: ItemType) => void;
}

export interface DemoNotification {
  id: string;
  type: ItemType;
  title: string;
  category?: string;
  location: string;
  time: string;
  item?: Item;
}

export const MovableNotification: React.FC<MovableNotificationProps> = ({
  items,
  onViewItemDetails,
  onOpenReportModal,
}) => {
  // Draggable position state
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Notifications Queue
  const [notifications, setNotifications] = useState<DemoNotification[]>([
    {
      id: 'demo-1',
      type: 'Found',
      title: 'Titan Steel Watch',
      category: 'Accessories',
      location: 'Central Library, Table 12',
      time: 'Just now',
    },
    {
      id: 'demo-2',
      type: 'Lost',
      title: 'Blue Campus Backpack',
      category: 'Bags & Pouches',
      location: 'Academic Block 2, Room 304',
      time: '2 mins ago',
    },
    {
      id: 'demo-3',
      type: 'Found',
      title: 'Apple AirPods Pro',
      category: 'Electronics',
      location: 'Student Cafeteria, Counter B',
      time: '5 mins ago',
    },
  ]);

  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);

  // Sync with real newly added items if available
  useEffect(() => {
    if (items && items.length > 0) {
      const latestItem = items[0];
      const exists = notifications.some((n) => n.id === latestItem.id);
      if (!exists) {
        const newNotif: DemoNotification = {
          id: latestItem.id,
          type: latestItem.type,
          title: latestItem.title,
          category: latestItem.category,
          location: latestItem.location,
          time: 'Just now',
          item: latestItem,
        };
        setNotifications((prev) => [newNotif, ...prev]);
        setCurrentNotificationIndex(0);
      }
    }
  }, [items]);

  // Auto-cycle demo notifications every 5 seconds unless paused
  useEffect(() => {
    if (notifications.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentNotificationIndex((prev) => (prev + 1) % notifications.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [notifications.length, isPaused]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      posStartRef.current = { ...position };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 350, posStartRef.current.x + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, posStartRef.current.y + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 320, posStartRef.current.x + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 180, posStartRef.current.y + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Simulate Triggering New Demo Alerts
  const triggerDemoNotification = (type: ItemType) => {
    const locations = ['Central Library', 'Main Cafeteria', 'Auditorium Hall', 'Hostel Block A', 'Sports Complex', 'CSE Lab 302'];
    const lostTitles = ['Boat Rockerz Headphones', 'Scientific Calculator FX-991', 'Engineering Drawing Board', 'Black Leather Wallet', 'Hostel Room Key 204'];
    const foundTitles = ['Apple AirPods Pro Case', 'Silver HP Laptop Charger', 'College ID Card', 'Noise ColorFit Smartwatch', 'Metal Water Bottle'];

    const randomLoc = locations[Math.floor(Math.random() * locations.length)];
    const randomTitle = type === 'Lost' 
      ? lostTitles[Math.floor(Math.random() * lostTitles.length)]
      : foundTitles[Math.floor(Math.random() * foundTitles.length)];

    const newNotif: DemoNotification = {
      id: `demo-${Date.now()}`,
      type,
      title: randomTitle,
      category: type === 'Lost' ? 'Personal Belongings' : 'Electronics',
      location: randomLoc,
      time: 'Just now',
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setCurrentNotificationIndex(0);
    setIsMinimized(false);
    setIsClosed(false);
  };

  if (isClosed) {
    return (
      <button
        onClick={() => setIsClosed(false)}
        className="fixed bottom-5 right-5 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-orange-500 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 text-xs font-black group"
        title="Open Draggable Live Notification Demo"
      >
        <div className="relative">
          <Bell className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
        </div>
        <span className="hidden sm:inline tracking-tight">Live Activity Widget</span>
      </button>
    );
  }

  const activeNotif = notifications[currentNotificationIndex] || notifications[0];

  return (
    <div
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed z-50 w-80 sm:w-92 bg-white/98 backdrop-blur-none border-2 border-slate-900 rounded-3xl shadow-2xl text-slate-900 transition-all ${
        isDragging ? 'scale-102 cursor-grabbing shadow-orange-500/20 ring-4 ring-orange-500/30' : ''
      }`}
    >
      {/* Sleek Dark Header Drag Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between cursor-grab select-none border-b border-slate-800"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1 bg-slate-800 rounded-lg border border-slate-700">
            <GripHorizontal className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400/40 animate-ping" />
            </div>
            <span className="text-xs font-black tracking-tight text-white flex items-center space-x-1">
              <span>Live Campus Broadcast</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="hidden sm:inline-block text-[9px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full font-mono font-bold text-orange-300">
            🖐️ Move Me
          </span>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title={isMinimized ? 'Expand Widget' : 'Minimize Widget'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsClosed(true)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Close Widget"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!isMinimized && (
        <div className="p-4 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white rounded-b-3xl">
          {/* Active Notification Card */}
          {activeNotif && (
            <div
              className={`p-3.5 rounded-2xl border-2 text-xs relative overflow-hidden transition-all shadow-sm ${
                activeNotif.type === 'Found'
                  ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-emerald-300 text-emerald-950'
                  : 'bg-gradient-to-br from-rose-50 via-white to-rose-50/40 border-rose-300 text-rose-950'
              }`}
            >
              {/* Header Badge Strip */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-white font-black text-[10px] tracking-wide shadow-sm ${
                    activeNotif.type === 'Found'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                      : 'bg-gradient-to-r from-rose-600 to-red-600'
                  }`}
                >
                  {activeNotif.type === 'Found' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      <span>ITEM FOUND</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-white" />
                      <span>ITEM LOST</span>
                    </>
                  )}
                </span>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 font-mono font-bold bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                    {activeNotif.time}
                  </span>
                </div>
              </div>

              {/* Title & Category */}
              <div className="space-y-0.5">
                <h4 className="font-black text-slate-900 text-sm leading-tight flex items-center justify-between">
                  <span>{activeNotif.title}</span>
                </h4>
                {activeNotif.category && (
                  <span className="inline-block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {activeNotif.category}
                  </span>
                )}
              </div>

              {/* Location Badge */}
              <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-[11px] mt-2 bg-white/90 p-2 rounded-xl border border-slate-200/80">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="truncate">{activeNotif.location}</span>
              </div>

              {/* Optional Link if item exists */}
              {activeNotif.item && onViewItemDetails && (
                <button
                  onClick={() => onViewItemDetails(activeNotif.item!)}
                  className="mt-2.5 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-xl flex items-center justify-center space-x-1 transition-all"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3 text-orange-400" />
                </button>
              )}
            </div>
          )}

          {/* Controls & Demo Actions */}
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            {/* Cycle Pagination Navigation */}
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
              <span className="flex items-center space-x-1">
                <Radio className="w-3 h-3 text-orange-500 animate-pulse" />
                <span>Live Feed</span>
              </span>

              {notifications.length > 1 && (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() =>
                      setCurrentNotificationIndex(
                        (prev) => (prev - 1 + notifications.length) % notifications.length
                      )
                    }
                    className="p-1 bg-slate-100 hover:bg-orange-100 rounded-lg text-slate-700 transition-colors"
                    title="Previous notification"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-extrabold">
                    {currentNotificationIndex + 1}/{notifications.length}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentNotificationIndex((prev) => (prev + 1) % notifications.length)
                    }
                    className="p-1 bg-slate-100 hover:bg-orange-100 rounded-lg text-slate-700 transition-colors"
                    title="Next notification"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Demo Trigger Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  triggerDemoNotification('Found');
                  if (onOpenReportModal) onOpenReportModal('Found');
                }}
                className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-[11px] rounded-xl shadow-md hover:shadow-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Report Found</span>
              </button>

              <button
                onClick={() => {
                  triggerDemoNotification('Lost');
                  if (onOpenReportModal) onOpenReportModal('Lost');
                }}
                className="px-3 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-[11px] rounded-xl shadow-md hover:shadow-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Report Lost</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
