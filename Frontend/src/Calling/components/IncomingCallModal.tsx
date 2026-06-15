import React from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa6';
import { CallAvatar } from './CallAvatar';
import { CallButton } from './CallButton';
import { CallUser } from '../types';

interface IncomingCallModalProps {
  caller: CallUser;
  status: 'incoming' | 'connecting' | 'rejected';
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  caller,
  status,
  onAccept,
  onReject,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 text-white overflow-hidden"
    >
      {/* Blurred backdrop using caller profile image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
        {caller.avatarUrl ? (
          <img
            src={caller.avatarUrl}
            alt="Backdrop"
            className="w-full h-full object-cover blur-3xl opacity-20 scale-125"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-zinc-900 to-zinc-950 opacity-80" />
        )}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/85 to-zinc-950" />
      </div>

      {/* Top Section */}
      <div className="relative z-10 pt-16 flex flex-col items-center">
        <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-4 animate-pulse">
          Voice Call
        </span>
      </div>

      {/* Center Section */}
      <div className="relative z-10 flex flex-col items-center px-6">
        <CallAvatar
          imageUrl={caller.avatarUrl}
          name={caller.name}
          size="xl"
          pulse={status === 'incoming'}
        />
        
        <h2 className="mt-8 text-3xl font-bold tracking-tight text-zinc-100">
          {caller.name}
        </h2>
        
        <p className="mt-3 text-sm text-zinc-400 font-medium tracking-wide">
          {status === 'incoming' && 'Incoming Voice Call'}
          {status === 'connecting' && 'Connecting...'}
          {status === 'rejected' && 'Call Declined'}
        </p>

        {status === 'connecting' && (
          <div className="mt-6 flex gap-1.5 justify-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 pb-24 px-6 flex justify-center items-center">
        {status === 'incoming' ? (
          <div className="flex gap-20 items-center justify-center">
            {/* Reject/Decline Button */}
            <CallButton
              icon={<FaPhoneSlash className="transform scale-x-[-1]" />}
              label="Decline"
              variant="decline"
              size="lg"
              onClick={onReject}
            />

            {/* Accept Button */}
            <CallButton
              icon={<FaPhone />}
              label="Accept"
              variant="accept"
              size="lg"
              onClick={onAccept}
            />
          </div>
        ) : status === 'rejected' ? (
          <div className="text-rose-500 font-semibold text-sm flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <FaPhoneSlash className="text-xl" />
            </div>
            <span>Call Declined</span>
          </div>
        ) : (
          <div className="text-emerald-500 font-semibold text-sm flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <span>Connecting...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default IncomingCallModal;
