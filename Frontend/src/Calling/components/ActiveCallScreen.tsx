import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft } from 'react-icons/fi';
import { FaPhone, FaMicrophone, FaMicrophoneSlash, FaVolumeHigh, FaBluetoothB, FaUserPlus, FaEllipsis } from 'react-icons/fa6';
import { MdDialpad } from 'react-icons/md';
import { CallAvatar } from './CallAvatar';
import { CallButton } from './CallButton';
import { CallTimer } from './CallTimer';
import { CallUser } from '../types';
import { useConnectionStats } from '../hooks/useConnectionStats';
import { LatencyBadge } from './LatencyBadge';

interface ActiveCallScreenProps {
  recipient: CallUser;
  formattedTime: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isBluetoothConnected: boolean;
  onMuteToggle: () => void;
  onSpeakerToggle: () => void;
  onBluetoothToggle: () => void;
  onEndCall: () => void;
  onAddUser?: () => void;
  onKeypad?: () => void;
  onMore?: () => void;
  onBack?: () => void;
  peerConnection?: RTCPeerConnection | null;
}

export const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  recipient,
  formattedTime,
  isMuted,
  isSpeakerOn,
  isBluetoothConnected,
  onMuteToggle,
  onSpeakerToggle,
  onBluetoothToggle,
  onEndCall,
  onAddUser = () => {},
  onKeypad = () => {},
  onMore = () => {},
  onBack = () => {},
  peerConnection = null,
}) => {
  const { ping, connectionQuality, networkStatus } = useConnectionStats({ peerConnection });

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

      {/* Header Section */}
      <div className="relative z-10 px-6 pt-12 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 transition-colors border border-zinc-800/40 cursor-pointer"
        >
          <FiChevronLeft className="text-xl" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="text-zinc-100 font-bold text-base leading-tight">
            {recipient.name}
          </span>
          
          {/* Dynamic connection quality status */}
          <span className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 transition-colors duration-300 ${
            networkStatus === 'Connected' ? 'text-emerald-400' :
            networkStatus === 'Poor Connection' ? 'text-amber-400' :
            networkStatus === 'Connection Unstable' ? 'text-orange-400' : 'text-rose-500 animate-pulse'
          }`}>
            {networkStatus}
          </span>

          <div className="flex items-center gap-1.5 mt-1 bg-zinc-900/40 px-2.5 py-0.5 rounded-full border border-zinc-800/40">
            <CallTimer time={formattedTime} className="text-xs font-semibold text-zinc-400" />
          </div>

          {/* Compact Latency / Ping indicator */}
          <div className="mt-1.5">
            <LatencyBadge ping={ping} connectionQuality={connectionQuality} />
          </div>
        </div>

        {/* Small thumbnail avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700/50 shadow-md">
          {recipient.avatarUrl ? (
            <img src={recipient.avatarUrl} alt={recipient.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-semibold text-xs text-white">
              {recipient.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Center Section: Avatar with expanding audio waves */}
      <div className="relative z-10 flex flex-col items-center justify-center py-6">
        <CallAvatar
          imageUrl={recipient.avatarUrl}
          name={recipient.name}
          size="lg"
          wave={true}
        />
        
        <p className={`mt-12 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-all duration-300 ${
          networkStatus === 'Connected' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
          networkStatus === 'Poor Connection' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
          networkStatus === 'Connection Unstable' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
          'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse'
        }`}>
          {networkStatus}
        </p>
      </div>

      {/* Call Controls Section */}
      <div className="relative z-10 bg-zinc-900/90 backdrop-blur-md rounded-t-[2.5rem] border-t border-zinc-800/80 px-6 pt-8 pb-10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-xs mx-auto flex flex-col gap-6">
          {/* Row 1: Mute, Speaker, Bluetooth */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            <CallButton
              icon={isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              label="Mute"
              active={isMuted}
              onClick={onMuteToggle}
            />
            
            <CallButton
              icon={<FaVolumeHigh />}
              label="Speaker"
              active={isSpeakerOn}
              onClick={onSpeakerToggle}
            />
            
            <CallButton
              icon={<FaBluetoothB />}
              label="Bluetooth"
              active={isBluetoothConnected}
              onClick={onBluetoothToggle}
            />
          </div>

          {/* Row 2: Add User, Keypad, More */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            <CallButton
              icon={<FaUserPlus />}
              label="Add"
              onClick={onAddUser}
            />
            
            <CallButton
              icon={<MdDialpad />}
              label="Keypad"
              onClick={onKeypad}
            />
            
            <CallButton
              icon={<FaEllipsis />}
              label="More"
              onClick={onMore}
            />
          </div>

          {/* Row 3: End Call */}
          <div className="flex justify-center mt-2 border-t border-zinc-800/40 pt-6">
            <CallButton
              icon={<FaPhone className="transform rotate-[135deg]" />}
              label="End Call"
              variant="danger"
              size="lg"
              onClick={onEndCall}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default ActiveCallScreen;
