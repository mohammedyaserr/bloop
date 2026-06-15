import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CallState, CallUser } from './types';
import { useCallTimer } from './hooks/useCallTimer';
import IncomingCallModal from './components/IncomingCallModal';
import OutgoingCallScreen from './components/OutgoingCallScreen';
import ActiveCallScreen from './components/ActiveCallScreen';
import CallEndedScreen from './components/CallEndedScreen';

interface CallContainerProps {
  user: CallUser;
  direction: 'incoming' | 'outgoing';
  isActive: boolean;
  onClose: () => void;
  // Optional external state controls (to bypass automatic simulators if desired)
  externalCallState?: CallState;
  onStateChange?: (state: CallState) => void;
}

export const CallContainer: React.FC<CallContainerProps> = ({
  user,
  direction,
  isActive,
  onClose,
  externalCallState,
  onStateChange,
}) => {
  // Use custom call timer hook
  const { formattedTime, start, stop, reset } = useCallTimer();

  // Internal state machine
  const [internalState, setInternalState] = useState<CallState>('idle');
  const [incomingSubstate, setIncomingSubstate] = useState<'incoming' | 'connecting' | 'rejected'>('incoming');
  const [outgoingSubstate, setOutgoingSubstate] = useState<'calling' | 'ringing' | 'connecting' | 'connected'>('calling');

  // Media toggle states
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);

  // Sync internal state with active status and direction
  useEffect(() => {
    if (isActive) {
      if (externalCallState) {
        setInternalState(externalCallState);
      } else {
        setInternalState(direction === 'incoming' ? 'incoming' : 'outgoing');
      }
      setIncomingSubstate('incoming');
      setOutgoingSubstate('calling');
      setIsMuted(false);
      setIsSpeakerOn(false);
      setIsBluetoothConnected(false);
    } else {
      setInternalState('idle');
      reset();
    }
  }, [isActive, direction, externalCallState, reset]);

  // Handle reporting state changes back to parent
  const changeState = (newState: CallState) => {
    setInternalState(newState);
    if (onStateChange) onStateChange(newState);
  };

  // Outgoing simulation flow
  useEffect(() => {
    if (internalState !== 'outgoing' || externalCallState) return;

    setOutgoingSubstate('calling');
    
    // Simulate Calling... -> Ringing... after 1.5s
    const ringTimeout = window.setTimeout(() => {
      setOutgoingSubstate('ringing');
    }, 1500);

    // Simulate Ringing... -> Connecting... after 4s
    const connectTimeout = window.setTimeout(() => {
      setOutgoingSubstate('connecting');
    }, 4000);

    // Simulate Connecting... -> Connected after 5.5s
    const connectedTimeout = window.setTimeout(() => {
      setOutgoingSubstate('connected');
      changeState('connected');
    }, 5500);

    return () => {
      window.clearTimeout(ringTimeout);
      window.clearTimeout(connectTimeout);
      window.clearTimeout(connectedTimeout);
    };
  }, [internalState, externalCallState]);

  // Start/Stop timer when connected/disconnected
  useEffect(() => {
    if (internalState === 'connected') {
      start();
    } else {
      stop();
    }
  }, [internalState, start, stop]);

  // ==========================================
  // FUTURE WEBRTC INTEGRATION PLACEHOLDERS
  // ==========================================
  const onAcceptCall = () => {
    console.log('WebRTC placeholder: onAcceptCall() initiated.');
    // WEBRTC INTEGRATION:
    // 1. Get user media (navigator.mediaDevices.getUserMedia)
    // 2. Initialize RTCPeerConnection and add tracks
    // 3. Create and send Session Description Protocol (SDP) answer
  };

  const onRejectCall = () => {
    console.log('WebRTC placeholder: onRejectCall() initiated.');
    // WEBRTC INTEGRATION:
    // 1. Emit call rejection payload to signaling server (e.g. Socket.io)
    // 2. Clean up signaling session
  };

  const onEndCall = () => {
    console.log('WebRTC placeholder: onEndCall() initiated.');
    // WEBRTC INTEGRATION:
    // 1. Stop all media track execution in local MediaStream
    // 2. Close peer connection (pc.close()) and nullify peer connection objects
    // 3. Send hang up event to signal broker
  };

  const onMuteToggle = (muted: boolean) => {
    console.log(`WebRTC placeholder: onMuteToggle(isMuted = ${muted})`);
    // WEBRTC INTEGRATION:
    // 1. Extract audio track from localMediaStream: stream.getAudioTracks()[0]
    // 2. Set track.enabled = !muted
  };

  const onSpeakerToggle = (speakerOn: boolean) => {
    console.log(`WebRTC placeholder: onSpeakerToggle(isSpeakerOn = ${speakerOn})`);
    // WEBRTC INTEGRATION:
    // 1. Retrieve output audio HTML element reference
    // 2. Select appropriate audio output device ID (e.g. built-in speaker sinkId)
    // 3. call element.setSinkId(sinkId) if supported by browser
  };

  const onBluetoothToggle = (bluetoothConnected: boolean) => {
    console.log(`WebRTC placeholder: onBluetoothToggle(isBluetoothConnected = ${bluetoothConnected})`);
    // WEBRTC INTEGRATION:
    // 1. Query device descriptors from navigator.mediaDevices.enumerateDevices()
    // 2. Search for active Bluetooth headset / handsfree output profiles
    // 3. Call element.setSinkId(bluetoothDeviceId)
  };

  // Button Action Handlers
  const handleAccept = () => {
    setIncomingSubstate('connecting');
    onAcceptCall();
    
    // Simulate connection handshake lag before transitioning to active call panel
    window.setTimeout(() => {
      changeState('connected');
    }, 1500);
  };

  const handleReject = () => {
    setIncomingSubstate('rejected');
    onRejectCall();

    // Hold visual rejection message for 2 seconds, then transition to call ended
    window.setTimeout(() => {
      changeState('ended');
    }, 2000);
  };

  const handleEndCall = () => {
    onEndCall();
    changeState('ended');
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    onMuteToggle(nextMute);
  };

  const handleSpeakerToggle = () => {
    const nextSpeaker = !isSpeakerOn;
    setIsSpeakerOn(nextSpeaker);
    onSpeakerToggle(nextSpeaker);
  };

  const handleBluetoothToggle = () => {
    const nextBluetooth = !isBluetoothConnected;
    setIsBluetoothConnected(nextBluetooth);
    onBluetoothToggle(nextBluetooth);
  };

  if (!isActive || internalState === 'idle') return null;

  return (
    <div className="relative w-full h-full md:max-w-md md:h-[720px] md:rounded-[2rem] md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden md:border md:border-zinc-800 bg-zinc-950 flex flex-col justify-between">
      <AnimatePresence mode="wait">
        {internalState === 'incoming' && (
          <IncomingCallModal
            caller={user}
            status={incomingSubstate}
            onAccept={handleAccept}
            onReject={handleReject}
            key="incoming-modal"
          />
        )}

        {internalState === 'outgoing' && (
          <OutgoingCallScreen
            recipient={user}
            status={outgoingSubstate}
            onEndCall={handleEndCall}
            key="outgoing-screen"
          />
        )}

        {internalState === 'connected' && (
          <ActiveCallScreen
            recipient={user}
            formattedTime={formattedTime}
            isMuted={isMuted}
            isSpeakerOn={isSpeakerOn}
            isBluetoothConnected={isBluetoothConnected}
            onMuteToggle={handleMuteToggle}
            onSpeakerToggle={handleSpeakerToggle}
            onBluetoothToggle={handleBluetoothToggle}
            onEndCall={handleEndCall}
            onBack={onClose}
            key="active-screen"
          />
        )}

        {internalState === 'ended' && (
          <CallEndedScreen
            recipient={user}
            formattedDuration={formattedTime}
            onFinished={onClose}
            key="ended-screen"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CallContainer;
