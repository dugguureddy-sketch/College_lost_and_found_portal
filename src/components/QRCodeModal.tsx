import React, { useEffect, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  QrCode, 
  Smartphone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Tag, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';
import { Item } from '../types';

interface QRCodeModalProps {
  item: Item;
  onClose: () => void;
  onSimulateScan?: (itemId: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ item, onClose, onSimulateScan }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'poster' | 'qr-only'>('poster');

  // Compute mobile target URL for deep linking
  const targetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?itemId=${encodeURIComponent(item.id)}`
    : `https://campus-lostfound.edu/?itemId=${item.id}`;

  useEffect(() => {
    // Generate high resolution QR code data URL
    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR Code:', err));

    // Keyboard ESC key handler for closing menu
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetUrl, onClose]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `lost-item-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden print:p-0 print:bg-white print:static print:block cursor-pointer"
    >
      {/* Printable CSS inject */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-campus-flyer, #printable-campus-flyer * {
              visibility: visible !important;
            }
            #printable-campus-flyer {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 24px !important;
              background: white !important;
              border: none !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-orange-200 rounded-3xl max-w-xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto print:max-w-none print:w-full print:rounded-none print:shadow-none print:p-0 cursor-default"
      >
        {/* Sticky Header (hidden in print) */}
        <div className="no-print px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-20">
          <div className="flex items-center space-x-2 pr-2">
            <QrCode className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Campus QR & Printable Poster</h2>
              <p className="text-[11px] text-slate-500 font-medium">Scan code on mobile to view report directly</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex bg-orange-50 p-1 rounded-xl border border-orange-200">
              <button
                onClick={() => setViewMode('poster')}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                  viewMode === 'poster' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Poster
              </button>
              <button
                onClick={() => setViewMode('qr-only')}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                  viewMode === 'qr-only' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                QR Display
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Container */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">

        {/* PRINTABLE CAMPUS FLYER & POSTER CONTAINER */}
        <div id="printable-campus-flyer" className="space-y-4">
          {viewMode === 'poster' ? (
            <div className="bg-gradient-to-b from-orange-50 to-white border-4 border-orange-500 rounded-3xl p-6 text-slate-900 relative shadow-inner print:border-4 print:border-orange-500">
              {/* Poster Header Banner */}
              <div className="text-center pb-4 border-b-2 border-orange-200 mb-4">
                <div className="inline-flex items-center space-x-2 bg-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span>CAMPUS LOST ITEM ALERT</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                  {item.title}
                </h1>
                <p className="text-xs text-orange-600 font-extrabold mt-1 uppercase tracking-wide">
                  Category: {item.category} • Posted by {item.userName} ({item.userBranch})
                </p>
              </div>

              {/* Poster Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-6">
                {/* Image */}
                <div className="w-full h-44 bg-slate-100 rounded-2xl overflow-hidden border-2 border-orange-200 relative">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                    Item Photo
                  </div>
                </div>

                {/* Details Summary */}
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Last Seen Location</span>
                    <span className="font-extrabold text-rose-600 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.location} {item.roomDetails ? `(${item.roomDetails})` : ''}</span>
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Date Lost</span>
                    <span className="font-bold text-slate-800 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>{item.date} {item.time ? `at ${item.time}` : ''}</span>
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Description</span>
                    <p className="text-slate-700 line-clamp-2 text-[11px] font-medium">{item.description}</p>
                  </div>
                </div>
              </div>

              {/* QR SCAN BLOCK */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border-2 border-slate-800 shadow-md">
                <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg border border-slate-200">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Item QR Code" className="w-32 h-32 object-contain" />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-xs font-bold">
                      Generating...
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center space-x-1 bg-orange-500 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase">
                    <Smartphone className="w-3 h-3" />
                    <span>Scan with Mobile Camera</span>
                  </div>
                  <h3 className="text-base font-black text-white leading-tight">
                    Found or Recognized This Item?
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Point your camera at the QR code to open item details on your phone, securely notify owner, or submit a match report!
                  </p>
                  <div className="text-[10px] font-mono text-amber-300 pt-1 font-bold">
                    Item ID: {item.id} • Campus Lost & Found System
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="mt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Official Campus Lost & Found • Authorized Notice Board Poster
              </div>
            </div>
          ) : (
            /* QR ONLY DIGITAL VIEW */
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8 text-center space-y-4">
              <div className="inline-block bg-white p-5 rounded-3xl border-2 border-orange-200 shadow-xl max-w-xs mx-auto">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto object-contain" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR Code...
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                  <span className="font-black text-slate-900 text-sm block">{item.title}</span>
                  <span className="text-[11px] font-bold text-orange-600 block">Unique QR Code ID: {item.id}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                Display this QR Code on your tablet, laptop, or phone screen for students to scan directly on campus.
              </p>
            </div>
          )}
        </div> {/* End #printable-campus-flyer */}
      </div> {/* End Scrollable Body */}

      {/* Action Buttons (Hidden when printing) */}
      <div className="no-print px-5 py-3 border-t border-orange-100 flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-slate-50/90 rounded-b-3xl">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 text-white font-black text-xs rounded-xl shadow-md shadow-orange-200 flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Flyer</span>
            </button>

            <button
              onClick={handleDownloadQR}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Download QR</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-white hover:bg-orange-50 border border-orange-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-black">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {onSimulateScan && (
              <button
                onClick={() => {
                  onSimulateScan(item.id);
                  onClose();
                }}
                className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-xs rounded-xl border border-emerald-300 flex items-center space-x-1.5 transition-all"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Test Scan</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300 transition-all flex items-center space-x-1"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
