import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { CallUser, CallState } from './types';
import { useCallTimer } from './hooks/useCallTimer';

import { IncomingCallModal } from './components/IncomingCallModal';
import { OutgoingCallScreen } from './components/OutgoingCallScreen';
import { ActiveCallScreen } from './components/ActiveCallScreen';
import { CallEndedScreen } from './components/CallEndedScreen';

class ToneGenerator {
  private ctx: AudioContext | null = null;
  private currentOscs: OscillatorNode[] = [];
  private currentGains: GainNode[] = [];
  private ringInterval: any = null;

  private initCtx() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  playDialTone() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.frequency.value = 350;
      osc2.frequency.value = 440;
      gain.gain.value = 0.03; // low volume comfort level

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.currentOscs = [osc1, osc2];
      this.currentGains = [gain];
    } catch (e) {
      console.error(e);
    }
  }

  playRingTone() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    try {
      const playPulse = () => {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        gain.gain.value = 0.05;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();

        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch {}
        }, 2000);
      };

      playPulse();
      this.ringInterval = setInterval(playPulse, 6000);
    } catch (e) {
      console.error(e);
    }
  }

  playConnectBeep() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.error(e);
    }
  }

  playDisconnectBeep() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.error(e);
    }
  }

  playToggleBeep() {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1000, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.error(e);
    }
  }

  stop() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    this.currentOscs.forEach(o => {
      try { o.stop(); } catch {}
    });
    this.currentOscs = [];
    this.currentGains = [];
  }
}

export interface CallContextType {
  isCallActive: boolean;
  callDirection: 'incoming' | 'outgoing' | null;
  callState: CallState;
  remoteUser: CallUser | null;
  duration: number;
  formattedDuration: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isBluetoothConnected: boolean;
  startCall: (targetUser: CallUser) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  toggleBluetooth: () => void;
  peerConnection: RTCPeerConnection | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);

  // Calling States
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDirection, setCallDirectionState] = useState<'incoming' | 'outgoing' | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [remoteUser, setRemoteUser] = useState<CallUser | null>(null);

  // Status and toggles
  const [outgoingStatus, setOutgoingStatus] = useState<'calling' | 'ringing' | 'connecting' | 'connected'>('calling');
  const [endedStatusText, setEndedStatusText] = useState('Call Ended');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);

  // References to prevent memory leaks or stale closures
  const localStreamRef = useRef<MediaStream | null>(null);
  const toneGen = useRef<ToneGenerator | null>(null);
  const missedCallTimeoutRef = useRef<any>(null);
  const remoteUserRef = useRef<CallUser | null>(null);

  // Refs for tracking states reactively inside callbacks without triggering socket reconnects
  const isCallActiveRef = useRef(false);
  const callStateRef = useRef<CallState>('idle');
  const isMutedRef = useRef(false);
  const socketRef = useRef<any>(null);

  // WebRTC References and States
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [peerConn, setPeerConn] = useState<RTCPeerConnection | null>(null);

  // Component state and callback references to prevent reconnect loops
  const callDirectionRef = useRef<'incoming' | 'outgoing' | null>(null);
  const initializePeerConnectionRef = useRef<any>(null);
  const resetCallRef = useRef<any>(null);
  const acquireMediaRef = useRef<any>(null);
  const currentUserRef = useRef<any>(null);
  const endCallRef = useRef<any>(null);

  const setCallDirection = useCallback((dir: 'incoming' | 'outgoing' | null) => {
    setCallDirectionState(dir);
    callDirectionRef.current = dir;
  }, []);

  // Sync latest state and callbacks to refs
  useEffect(() => {
    initializePeerConnectionRef.current = initializePeerConnection;
    resetCallRef.current = resetCall;
    acquireMediaRef.current = acquireMedia;
    currentUserRef.current = currentUser;
    endCallRef.current = endCall;
  });


  // Initialize ToneGenerator on client-side
  if (!toneGen.current && typeof window !== 'undefined') {
    toneGen.current = new ToneGenerator();
  }

  // High precision timer hook
  const { seconds: duration, formattedTime, start: startTimer, stop: stopTimer, reset: resetTimer } = useCallTimer();

  // Helper state setters that also update refs
  const updateCallState = (state: CallState) => {
    setCallState(state);
    callStateRef.current = state;
  };

  const updateIsCallActive = (active: boolean) => {
    setIsCallActive(active);
    isCallActiveRef.current = active;
  };

  // 1. Fetch current logged-in user dynamically to handle logins/logouts
  const getLoggedInUser = () => {
    try {
      const userStr = localStorage.getItem('bloop_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkUser = () => {
      const user = getLoggedInUser();
      if (user?.id !== currentUser?.id) {
        setCurrentUser(user);
      }
    };
    checkUser();
    const interval = setInterval(checkUser, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Clean up streams/tones on unmount
  useEffect(() => {
    return () => {
      if (toneGen.current) toneGen.current.stop();
      releaseMediaAndWebRTC();
    };
  }, []);

  // Media Acquisition/Release Functions
  const acquireMedia = async () => {
    try {
      console.log('🎙️ [Call] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      // Apply initial mute state
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMutedRef.current;
      });
      console.log("MICROPHONE ACQUIRED", stream);
      return stream;
    } catch (err) {
      console.error("MICROPHONE FAILED", err);
      return null;
    }
  };

  const releaseMediaAndWebRTC = useCallback(() => {
    console.log('⏹️ [Call] Releasing streams and peer connection...');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setPeerConn(null);
    
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
      try {
        remoteAudioRef.current.remove();
      } catch {}
      remoteAudioRef.current = null;
    }
  }, []);

  // Action helper definitions (defined early to prevent hoisting reference warnings)
  const resetCall = useCallback(() => {
    updateIsCallActive(false);
    setCallDirection(null);
    updateCallState('idle');
    setRemoteUser(null);
    remoteUserRef.current = null;
    setIsMuted(false);
    isMutedRef.current = false;
    setIsSpeakerOn(false);
    setIsBluetoothConnected(false);

    if (toneGen.current) toneGen.current.stop();
    releaseMediaAndWebRTC();
  }, [releaseMediaAndWebRTC]);

  const endCall = useCallback(() => {
    if (!currentUser || !socketRef.current || !remoteUserRef.current) return;
    
    const isOutgoing = callDirectionRef.current === 'outgoing';
    const sId = isOutgoing ? currentUser.id : remoteUserRef.current.id;
    const rId = isOutgoing ? remoteUserRef.current.id : currentUser.id;

    console.log(`[CallEvent] call:ended (emit) | Sender: ${sId} | Receiver: ${rId} | Timestamp: ${new Date().toISOString()} | Payload:`, {
      senderId: sId,
      receiverId: rId
    });

    socketRef.current.emit('call:ended', {
      senderId: sId,
      receiverId: rId
    });

    if (toneGen.current) toneGen.current.playDisconnectBeep();
    setEndedStatusText('Call Ended');
    updateCallState('ended');
    setTimeout(() => {
      resetCall();
    }, 2000);
  }, [currentUser, resetCall]);

  const rejectCall = useCallback(() => {
    if (!currentUser || !socketRef.current || !remoteUserRef.current) return;

    console.log("CALL REJECTED EMITTED", {
      senderId: remoteUserRef.current.id,
      receiverId: currentUser.id
    });

    socketRef.current.emit('call:rejected', {
      senderId: remoteUserRef.current.id,
      receiverId: currentUser.id
    });

    resetCall();
  }, [currentUser, resetCall]);

  const acceptCall = useCallback(async () => {
    if (!currentUser || !socketRef.current || !remoteUserRef.current) return;

    console.log("CALL ACCEPTED EMITTED", {
      senderId: remoteUserRef.current.id,
      receiverId: currentUser.id
    });

    if (toneGen.current) toneGen.current.playConnectBeep();
    updateCallState('connecting');
    
    // Acquire mic and start connection on accept click
    const stream = await acquireMedia();
    await initializePeerConnection(remoteUserRef.current.id, stream);
    
    socketRef.current.emit('call:accepted', {
      senderId: remoteUserRef.current.id,
      receiverId: currentUser.id
    });
  }, [currentUser]);

  // WebRTC Connection Setup Function
  const initializePeerConnection = useCallback(async (targetUserId: string, stream: MediaStream | null) => {
    console.log('🔌 [WebRTC] Creating RTCPeerConnection...');
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    });

    peerConnectionRef.current = pc;
    setPeerConn(pc);

    console.log("RTCPeerConnection created");

    // Log ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log("ICE Gathering State changed:", pc.iceGatheringState);
    };

    // Send local ICE candidates to peer
    pc.onicecandidate = (event) => {
      const currentUserId = currentUserRef.current?.id;
      if (event.candidate && socketRef.current && currentUserId) {
        console.log("ICE SENT", event.candidate);
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          senderId: currentUserId,
          receiverId: targetUserId
        });
      }
    };

    // Track state changes
    pc.onconnectionstatechange = () => {
      console.log(`🔌 [WebRTC] Connection State changed: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        updateCallState('connected');
        setOutgoingStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.warn('⚠️ [WebRTC] Peer connection disconnected or failed');
        setEndedStatusText('Connection Lost');
        if (endCallRef.current) {
          endCallRef.current();
        } else {
          endCall();
        }
      }
    };

    // Play remote audio track when received
    pc.ontrack = (event) => {
      console.log("ontrack fires with streams:", event.streams);
      if (!remoteAudioRef.current && typeof window !== 'undefined') {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.style.display = 'none';
        document.body.appendChild(audio);
        remoteAudioRef.current = audio;
        console.log("audio autoplay configuration applied");
      }
      if (remoteAudioRef.current) {
        console.log("remote audio element receives stream", event.streams[0]);
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    // Add local microphone stream tracks
    if (stream) {
      console.log('🎙️ [WebRTC] Adding local audio tracks to peer connection');
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    return pc;
  }, []);

  // 2. Initialize calling socket when user is logged in
  useEffect(() => {
    const userId = currentUser?.id;
    if (!userId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = (import.meta as any).env.VITE_API_URL || 'https://bloop-af6u.onrender.com';
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log("Socket Connected", socketInstance.id);
      console.log("Current User", currentUser);
      console.log("Current User Ref", currentUserRef.current);
      console.log(`🔌 [CallSocket] Connected successfully. Joining room user_${userId}. socket.connected = ${socketInstance.connected}`);
      socketInstance.emit('join-user-room', userId);
    });

    // Handle Incoming Call Event
    socketInstance.on('incoming-call', (data: any) => {
      console.log("INCOMING CALL RECEIVED", data);
      
      const currentUserId = currentUserRef.current?.id;
      // If we are already in an active session, automatically decline (busy)
      if (isCallActiveRef.current || callStateRef.current !== 'idle') {
        console.log("CALL REJECTED EMITTED", { senderId: data.senderId, receiverId: currentUserId });
        socketInstance.emit('call:rejected', {
          senderId: data.senderId,
          receiverId: currentUserId
        });
        return;
      }

      const target = {
        id: data.senderId,
        name: data.callerName || 'Unknown Caller',
        avatarUrl: data.callerAvatar || null,
        phoneNumber: ''
      };
      setRemoteUser(target);
      remoteUserRef.current = target;
      
      setCallDirection('incoming');
      updateCallState('incoming');
      updateIsCallActive(true);

      // Play ringing sound
      if (toneGen.current) toneGen.current.playRingTone();

      // Emit call:ringing back to caller
      socketInstance.emit('call:ringing', {
        senderId: data.senderId,
        receiverId: currentUserId
      });
    });

    // Handle Call Ringing Event (Caller side)
    socketInstance.on('call:ringing', (data: any) => {
      const currentUserId = currentUserRef.current?.id;
      console.log(`[CallEvent] call:ringing (receive) | Sender: ${data.senderId} | Receiver: ${currentUserId} | Timestamp: ${new Date().toISOString()} | Payload:`, data);
      setOutgoingStatus('ringing');
      if (toneGen.current) toneGen.current.playRingTone();
    });

    // Handle Call Accepted Event (Caller side)
    socketInstance.on('call:accepted', async (data: any) => {
      console.log("CALL ACCEPTED RECEIVED", data);
      if (toneGen.current) toneGen.current.playConnectBeep();
      
      updateCallState('connecting');
      setOutgoingStatus('connecting');

      // Caller starts WebRTC session by acquiring media & creating connection
      const stream = await acquireMediaRef.current();
      const targetId = remoteUserRef.current?.id || data.senderId;
      const pc = await initializePeerConnectionRef.current(targetId, stream);
      
      // Create offer and send to receiver
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      
      console.log("WEBRTC OFFER CREATED", offer);
      
      const currentUserId = currentUserRef.current?.id;
      socketInstance.emit('webrtc-offer', {
        sdp: offer,
        senderId: currentUserId,
        receiverId: targetId
      });
    });

    // Handle WebRTC Offer (Receiver side)
    socketInstance.on('webrtc-offer', async (data: any) => {
      const currentUserId = currentUserRef.current?.id;
      console.log("WEBRTC OFFER RECEIVED", data);
      
      let pc = peerConnectionRef.current;
      if (!pc) {
        const stream = localStreamRef.current || await acquireMediaRef.current();
        pc = await initializePeerConnectionRef.current(data.senderId, stream);
      }

      if (!pc) {
        console.error("❌ peerConnection is null. Cannot set remote description.");
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log("WEBRTC ANSWER CREATED", answer);
      
      socketInstance.emit('webrtc-answer', {
        sdp: answer,
        senderId: currentUserId,
        receiverId: data.senderId
      });
    });

    // Handle WebRTC Answer (Caller side)
    socketInstance.on('webrtc-answer', async (data: any) => {
      console.log("WEBRTC ANSWER RECEIVED", data);
      
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    });

    // Handle ICE candidates
    socketInstance.on('ice-candidate', async (data: any) => {
      console.log("ICE RECEIVED", data.candidate);
      
      const pc = peerConnectionRef.current;
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.warn('⚠️ [WebRTC] Error adding ICE Candidate:', e);
        }
      }
    });

    // Handle Call Rejected Event (Caller side)
    socketInstance.on('call:rejected', (data: any) => {
      console.log("CALL REJECTED RECEIVED", data);
      
      if (toneGen.current) toneGen.current.playDisconnectBeep();
      setEndedStatusText('Call Rejected');
      updateCallState('ended');
      setTimeout(() => {
        resetCallRef.current();
      }, 2000);
    });

    // Handle Call Ended Event (Both sides)
    socketInstance.on('call:ended', (data: any) => {
      const currentUserId = currentUserRef.current?.id;
      console.log(`[CallEvent] call:ended (receive) | Sender: ${data.senderId} | Receiver: ${currentUserId} | Timestamp: ${new Date().toISOString()} | Payload:`, data);
      
      if (toneGen.current) toneGen.current.playDisconnectBeep();
      setEndedStatusText(data.statusText || 'Call Ended');
      updateCallState('ended');
      setTimeout(() => {
        resetCallRef.current();
      }, 2000);
    });

    // Handle Call Missed / No Answer Event (Caller side)
    socketInstance.on('call:missed', (data: any) => {
      const currentUserId = currentUserRef.current?.id;
      console.log(`[CallEvent] call:missed (receive) | Sender: ${data.senderId} | Receiver: ${currentUserId} | Timestamp: ${new Date().toISOString()} | Payload:`, data);
      
      if (toneGen.current) toneGen.current.playDisconnectBeep();
      setEndedStatusText('No Answer');
      updateCallState('ended');
      setTimeout(() => {
        resetCallRef.current();
      }, 2000);
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 [CallSocket] Disconnecting socket instance...');
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?.id]);

  // 3. Monitor Call Duration Timer
  useEffect(() => {
    if (callState === 'connected') {
      startTimer();
    } else {
      stopTimer();
      if (callState === 'idle') {
        resetTimer();
      }
    }
  }, [callState]);

  // 4. Handle Call Missed (30s timeout)
  useEffect(() => {
    if (callState === 'outgoing' || callState === 'incoming') {
      missedCallTimeoutRef.current = setTimeout(() => {
        if (callState === 'outgoing' && socketRef.current && remoteUserRef.current && currentUser) {
          console.log('⏰ Call timed out. Emitting call:missed');
          socketRef.current.emit('call:missed', {
            senderId: currentUser.id,
            receiverId: remoteUserRef.current.id
          });
          if (toneGen.current) toneGen.current.playDisconnectBeep();
          setEndedStatusText('No Answer');
          updateCallState('ended');
          setTimeout(() => {
            resetCall();
          }, 2000);
        } else if (callState === 'incoming') {
          // Auto close for receiver side
          resetCall();
        }
      }, 30000); // 30 seconds answer window
    }

    return () => {
      if (missedCallTimeoutRef.current) {
        clearTimeout(missedCallTimeoutRef.current);
      }
    };
  }, [callState, currentUser, resetCall]);

  // Handle browser tab closes & page unloads to cleanly notify peer
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isCallActiveRef.current && socketRef.current && remoteUserRef.current && currentUser) {
        socketRef.current.emit('call:ended', {
          senderId: currentUser.id,
          receiverId: remoteUserRef.current.id
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  // 5. Actions Exposed to App
  const startCall = (targetUser: CallUser) => {
    if (!currentUser || !socketRef.current) {
      console.error('❌ Cannot start call: Socket or Current User not initialized');
      return;
    }

    const payload = {
      senderId: currentUser.id,
      receiverId: targetUser.id,
      callerName: currentUser.fullName || currentUser.username,
      callerAvatar: currentUser.avatar || null
    };

    console.log(`[CallEvent] call:start (emit) | Sender: ${currentUser.id} | Receiver: ${targetUser.id} | Timestamp: ${new Date().toISOString()} | Payload:`, payload);

    setRemoteUser(targetUser);
    remoteUserRef.current = targetUser;
    
    setCallDirection('outgoing');
    updateCallState('outgoing');
    setOutgoingStatus('calling');
    updateIsCallActive(true);

    if (toneGen.current) toneGen.current.playDialTone();

    socketRef.current.emit('call:start', payload);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      isMutedRef.current = nextMuted;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = !nextMuted;
        });
      }
      if (toneGen.current) toneGen.current.playToggleBeep();
      return nextMuted;
    });
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn((prev) => {
      const nextSpeaker = !prev;
      if (toneGen.current) toneGen.current.playToggleBeep();
      return nextSpeaker;
    });
  };

  const toggleBluetooth = () => {
    setIsBluetoothConnected((prev) => {
      const nextBluetooth = !prev;
      if (toneGen.current) toneGen.current.playToggleBeep();
      return nextBluetooth;
    });
  };

  return (
    <CallContext.Provider
      value={{
        isCallActive,
        callDirection,
        callState,
        remoteUser,
        duration,
        formattedDuration: formattedTime,
        isMuted,
        isSpeakerOn,
        isBluetoothConnected,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        toggleBluetooth,
        peerConnection: peerConn,
      }}
    >
      {children}
      {isCallActive && remoteUser && (
        <div className="fixed inset-0 w-full h-screen z-[9999] overflow-hidden select-none">
          {callState === 'incoming' && (
            <IncomingCallModal
              caller={remoteUser}
              status="incoming"
              onAccept={acceptCall}
              onReject={rejectCall}
            />
          )}
          {callState === 'outgoing' && (
            <OutgoingCallScreen
              recipient={remoteUser}
              status={outgoingStatus}
              onEndCall={endCall}
            />
          )}
          {(callState === 'connecting' || callState === 'connected') && (
            <ActiveCallScreen
              recipient={remoteUser}
              formattedTime={formattedTime}
              isMuted={isMuted}
              isSpeakerOn={isSpeakerOn}
              isBluetoothConnected={isBluetoothConnected}
              onMuteToggle={toggleMute}
              onSpeakerToggle={toggleSpeaker}
              onBluetoothToggle={toggleBluetooth}
              onEndCall={endCall}
              peerConnection={peerConn}
            />
          )}
          {callState === 'ended' && (
            <CallEndedScreen
              recipient={remoteUser}
              formattedDuration={formattedTime}
              statusText={endedStatusText}
              onFinished={resetCall}
            />
          )}
        </div>
      )}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
