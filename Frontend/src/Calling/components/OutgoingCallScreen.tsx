import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone } from 'react-icons/fa6';
import { CallAvatar } from './CallAvatar';
import { CallButton } from './CallButton';
import { CallUser } from '../types';

interface OutgoingCallScreenProps {
  recipient: CallUser;
  status: 'calling' | 'ringing' | 'connecting' | 'connected';
  onEndCall: () => void;
}

export const OutgoingCallScreen: React.FC<OutgoingCallScreenProps> = ({
  recipient,
  status,
  onEndCall,
}) => {
  const [dotIndex, setDotIndex] = useState(0);

  // Animate dots (•, ••, •••) below status
  useEffect(() => {
    const interval = window.setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 4);
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  const getDots = () => {
    switch (dotIndex) {
      case 1:
        return '•';
      case 2:
        return '••';
      case 3:
        return '•••';
      default:
        return '';
    }
  };

  const statusLabel = {
    calling: 'Calling',
    ringing: 'Ringing',
    connecting: 'Connecting',
    connected: 'Connected',
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 text-white overflow-hidden"
    >
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
        {recipient.avatarUrl ? (
          <img
            src={recipient.avatarUrl}
            alt="Backdrop"
            className="w-full h-full object-cover blur-3xl opacity-20 scale-125"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-zinc-900 to-zinc-950 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/85 to-zinc-950" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 pt-16 flex flex-col items-center">
        <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-4 animate-pulse">
          Outgoing Voice Call
        </span>
      </div>

      {/* Center Section */}
      <div className="relative z-10 flex flex-col items-center px-6">
        <CallAvatar
          imageUrl={recipient.avatarUrl}
          name={recipient.name}
          size="xl"
          pulse={true}
        />
        
        <h2 className="mt-8 text-3xl font-bold tracking-tight text-zinc-100">
          {recipient.name}
        </h2>
        
        <div className="mt-4 flex flex-col items-center h-16">
          <AnimatePresence mode="wait">
            <motion.p
              key={status}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold tracking-wider text-emerald-500 uppercase"
            >
              {statusLabel}
            </motion.p>
          </AnimatePresence>
          
          <span className="text-xl leading-none text-emerald-500 font-bold h-6 mt-1 select-none">
            {getDots()}
          </span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 pb-24 px-6 flex justify-center items-center">
        <CallButton
          icon={<FaPhone className="transform rotate-[135deg]" />}
          label="End Call"
          variant="danger"
          size="lg"
          onClick={onEndCall}
        />
      </div>
    </motion.div>
  );
};
export default OutgoingCallScreen;
