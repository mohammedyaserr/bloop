import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionQuality } from '../hooks/useConnectionStats';

interface LatencyBadgeProps {
  ping: number | null;
  connectionQuality: ConnectionQuality;
  showText?: boolean;
}

export const LatencyBadge: React.FC<LatencyBadgeProps> = ({
  ping,
  connectionQuality,
  showText = true,
}) => {
  const getQualityStyle = () => {
    switch (connectionQuality) {
      case 'Excellent':
        return {
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          dotColor: 'bg-emerald-500',
          label: 'Excellent',
        };
      case 'Good':
        return {
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          dotColor: 'bg-yellow-500',
          label: 'Good',
        };
      case 'Fair':
        return {
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
          dotColor: 'bg-orange-500',
          label: 'Fair',
        };
      case 'Poor':
      default:
        return {
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/20',
          dotColor: 'bg-rose-500',
          label: 'Poor',
        };
    }
  };

  const style = getQualityStyle();

  return (
    <motion.div
      layout
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-sm shadow-md transition-all duration-300 ${style.bgColor} ${style.borderColor} ${style.textColor}`}
    >
      {/* Animated Glowing Signal Dot */}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dotColor}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dotColor}`}></span>
      </span>

      {/* Latency text with smooth fade-in value transitions via framer-motion */}
      <div className="flex items-center gap-1">
        {showText && (
          <span className="opacity-85 font-medium">
            {style.label}
          </span>
        )}
        {showText && <span className="opacity-40 select-none">•</span>}
        <AnimatePresence mode="wait">
          <motion.span
            key={ping ?? 'lost'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="font-mono tabular-nums tracking-wide"
          >
            {ping !== null ? `${ping} ms` : 'Lost'}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LatencyBadge;
