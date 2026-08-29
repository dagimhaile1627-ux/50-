import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Type, Wifi, Battery, Signal } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    textScale,
    setTextScale,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${formattedHours}:${formattedMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const cycleTextScale = () => {
    if (textScale === 'normal') setTextScale('large');
    else if (textScale === 'large') setTextScale('extra_large');
    else setTextScale('normal');
  };

  return (
    <header className="bg-black text-white border-b border-neutral-800 shadow-md sticky top-0 z-30 select-none shrink-0">
      {/* Mobile Top System Status Bar */}
      <div className="w-full bg-black px-4 py-1 flex items-center justify-between text-[11px] font-semibold text-neutral-400 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
          <span>{currentTime}</span>
        </div>

        {/* System Icons: Signal, 5G, Wifi, Battery */}
        <div className="flex items-center gap-2 text-neutral-300">
          <Signal className="w-3 h-3 text-white" />
          <span className="text-[10px] font-bold text-white">5G</span>
          <Wifi className="w-3 h-3 text-white" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-bold text-white">100%</span>
            <Battery className="w-3.5 h-3.5 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Main Mobile App Bar */}
      <div className="w-full max-w-md mx-auto px-3.5 py-2 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-lg tracking-tight text-white font-serif">SilverHeart</span>
        </div>

        {/* Text Size Accessibility Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={cycleTextScale}
            id="btn-text-scaler"
            className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-neutral-700 tap-active"
            title="Adjust Text Size for Seniors (100%, 120%, 140%)"
          >
            <Type className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-bold text-white">
              {textScale === 'normal' ? 'A' : textScale === 'large' ? 'A+' : 'A++'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

