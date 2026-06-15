import React from 'react';
import { motion } from 'framer-motion';

interface CallAvatarProps {
  imageUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
  wave?: boolean;
}

export const CallAvatar: React.FC<CallAvatarProps> = ({
  imageUrl,
  name,
  size = 'md',
  pulse = false,
  wave = false,
}) => {
  // Extract initials (max 2 characters) for avatar fallback
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-4xl',
    xl: 'w-40 h-40 text-5xl',
  };

  const containerSizes = {
    sm: 48,
    md: 96,
    lg: 128,
    xl: 160,
  };

  const radius = containerSizes[size];

  const avatarContent = imageUrl ? (
    <img
      src={imageUrl}
      alt={name}
      className="w-full h-full object-cover rounded-full border-2 border-slate-700/50"
    />
  ) : (
    <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-semibold text-white shadow-inner">
      {initials}
    </div>
  );

  return (
    <div className="relative flex items-center justify-center">
      {/* Audio Wave Animations (multiple concentric expanding wave layers) */}
      {wave && (
        <>
          <motion.div
            className="absolute rounded-full bg-emerald-500/10 pointer-events-none"
            style={{ width: radius, height: radius }}
            animate={{
              scale: [1, 2.2],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute rounded-full bg-emerald-500/15 pointer-events-none"
            style={{ width: radius, height: radius }}
            animate={{
              scale: [1, 1.8],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 3,
              delay: 1,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute rounded-full bg-emerald-500/20 pointer-events-none"
            style={{ width: radius, height: radius }}
            animate={{
              scale: [1, 1.4],
              opacity: [0.9, 0],
            }}
            transition={{
              duration: 3,
              delay: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        </>
      )}

      {/* Main Avatar Container */}
      <motion.div
        className={`${sizeClasses[size]} relative rounded-full z-10 shadow-2xl flex-shrink-0`}
        animate={
          pulse
            ? {
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0 0px rgba(16, 185, 129, 0.3)',
                  '0 0 0 16px rgba(16, 185, 129, 0)',
                  '0 0 0 0px rgba(16, 185, 129, 0)',
                ],
              }
            : {}
        }
        transition={
          pulse
            ? {
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
            : {}
        }
      >
        {avatarContent}
      </motion.div>
    </div>
  );
};
export default CallAvatar;
