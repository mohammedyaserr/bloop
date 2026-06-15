import React from 'react';
import { motion } from 'framer-motion';

interface CallButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  variant?: 'accept' | 'decline' | 'control' | 'danger';
  active?: boolean;
  size?: 'md' | 'lg';
  disabled?: boolean;
}

export const CallButton: React.FC<CallButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'control',
  active = false,
  size = 'md',
  disabled = false,
}) => {
  // Styles based on variant and active states
  const getButtonStyles = () => {
    if (disabled) return 'bg-zinc-800/40 text-zinc-600 border border-zinc-700/20 cursor-not-allowed';

    switch (variant) {
      case 'accept':
        return 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400';
      case 'decline':
      case 'danger':
        return 'bg-rose-600 text-white shadow-[0_4px_20px_rgba(225,29,72,0.3)] hover:bg-rose-500';
      case 'control':
      default:
        if (active) {
          return 'bg-white text-zinc-900 shadow-[0_4px_15px_rgba(255,255,255,0.15)]';
        }
        return 'bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/40';
    }
  };

  const buttonSizeClasses = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-14 h-14 text-xl';

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.08 }}
        whileTap={disabled ? {} : { scale: 0.92 }}
        className={`flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer ${buttonSizeClasses} ${getButtonStyles()}`}
      >
        {icon}
      </motion.button>
      {label && (
        <span className={`text-xs select-none transition-colors duration-200 font-medium ${active ? 'text-white font-semibold' : 'text-zinc-400'}`}>
          {label}
        </span>
      )}
    </div>
  );
};
export default CallButton;
