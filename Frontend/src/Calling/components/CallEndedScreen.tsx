import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPhoneSlash } from 'react-icons/fa6';
import { CallAvatar } from './CallAvatar';
import { CallTimer } from './CallTimer';
import { CallUser } from '../types';

interface CallEndedScreenProps {
  recipient: CallUser;
  formattedDuration: string;
  onFinished: () => void;
  statusText?: string;
}

export const CallEndedScreen: React.FC<CallEndedScreenProps> = ({
  recipient,
  formattedDuration,
  onFinished,
  statusText,
}) => {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onFinished();
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [onFinished]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-10 flex flex-col justify-between bg-zinc-950 text-white overflow-hidden"
    >
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
        {recipient.avatarUrl ? (
          <img
            src={recipient.avatarUrl}
            alt="Backdrop"
            className="w-full h-full object-cover blur-3xl opacity-15 scale-125"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-zinc-900 to-zinc-950 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/85 to-zinc-950" />
      </div>

      {/* Header spacer */}
      <div className="pt-20" />

      {/* Center Section */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <CallAvatar
          imageUrl={recipient.avatarUrl}
          name={recipient.name}
          size="lg"
        />
        
        <h2 className="mt-8 text-3xl font-bold tracking-tight text-zinc-100">
          {recipient.name}
        </h2>
        
        <p className="mt-4 text-sm font-semibold tracking-wider text-rose-500 uppercase flex items-center gap-2 justify-center">
          <FaPhoneSlash /> {statusText || 'Call Ended'}
        </p>

        {/* Final Duration display */}
        <div className="mt-6 flex flex-col items-center">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Duration</span>
          <CallTimer time={formattedDuration} className="text-xl font-bold text-zinc-300 mt-1" />
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="pb-24" />
    </motion.div>
  );
};
export default CallEndedScreen;
