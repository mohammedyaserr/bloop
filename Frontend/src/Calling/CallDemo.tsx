import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CallContainer } from './CallContainer';
import { CallUser, CallState } from './types';
import { FaPhone, FaPhoneSlash, FaCheck, FaCircleInfo, FaWifi, FaSliders } from 'react-icons/fa6';
import { IoLogoWhatsapp } from 'react-icons/io';

const MOCK_USERS: CallUser[] = [
  {
    id: 'user1',
    name: 'John Doe',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
    phoneNumber: '+1 (555) 019-2834',
  },
  {
    id: 'user2',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
    phoneNumber: '+1 (555) 014-9982',
  },
  {
    id: 'user3',
    name: 'Marcus Aurelius',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&h=300&q=80',
    phoneNumber: '+1 (555) 998-1209',
  },
];

export const CallDemo: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<CallUser>(MOCK_USERS[0]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDirection, setCallDirection] = useState<'incoming' | 'outgoing'>('outgoing');
  const [currentCallState, setCurrentCallState] = useState<CallState>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Latency Simulator state
  const [simPing, setSimPing] = useState(25);
  const [simConnected, setSimConnected] = useState(true);

  // Keep window simulation variables synchronized with state
  useEffect(() => {
    (window as any).__bloopSimulatePing = simPing;
    (window as any).__bloopSimulateConnected = simConnected;
    window.dispatchEvent(new CustomEvent('bloop-sim-change'));
  }, [simPing, simConnected]);

  // Add logs helper
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setConsoleLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const changeSimPing = (val: number) => {
    setSimPing(val);
    addLog(`Simulated WebRTC latency changed: ${val} ms`);
  };

  const toggleSimConnected = (val: boolean) => {
    setSimConnected(val);
    addLog(`Simulated WebRTC connection status set: ${val ? 'CONNECTED' : 'DISCONNECTED'}`);
  };

  // Scroll logs to bottom
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Hook into web console to capture the simulated WebRTC triggers
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      const str = args.join(' ');
      if (str.includes('WebRTC placeholder') || str.includes('CallState') || str.includes('calling')) {
        addLog(str);
      }
    };

    addLog('Calling System UI initialized. Ready for simulation.');

    return () => {
      console.log = originalLog;
    };
  }, []);

  const startCall = (direction: 'incoming' | 'outgoing') => {
    if (isCallActive) return;
    setCallDirection(direction);
    setIsCallActive(true);
    setCurrentCallState(direction === 'incoming' ? 'incoming' : 'outgoing');
    addLog(`Simulated call started: ${direction.toUpperCase()} to/from ${selectedUser.name}`);
  };

  const handleCloseCall = () => {
    setIsCallActive(false);
    setCurrentCallState('idle');
    addLog('Call UI session ended.');
  };

  const handleStateChange = (state: CallState) => {
    setCurrentCallState(state);
    addLog(`Call state transition: -> ${state.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row justify-center items-stretch p-4 md:p-8 gap-8 overflow-y-auto">
      {/* Simulation Frame Container (Left Pane) */}
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900/20 rounded-3xl p-6 border border-zinc-800/40 shadow-2xl relative min-h-[500px]">
        <div className="absolute top-4 left-6 flex items-center gap-2">
          <IoLogoWhatsapp className="text-emerald-500 text-2xl animate-pulse" />
          <span className="font-semibold text-zinc-300 text-sm tracking-wide">Bloop Calling System Simulator</span>
        </div>

        <AnimatePresence mode="wait">
          {!isCallActive ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center p-8 max-w-sm"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-inner text-emerald-500">
                <IoLogoWhatsapp className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-zinc-200">No Active Call</h3>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                Initiate an incoming or outgoing voice call from the Control Deck on the right to test all states, layouts, and animations.
              </p>

              <div className="flex gap-4 mt-8 w-full">
                <button
                  onClick={() => startCall('incoming')}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 transition-colors font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <FaPhone className="text-xs" /> Simulate Incoming
                </button>
                <button
                  onClick={() => startCall('outgoing')}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 transition-colors font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-zinc-700/50 cursor-pointer"
                >
                  <FaPhone className="text-xs transform rotate-90" /> Simulate Outgoing
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CallContainer
                user={selectedUser}
                direction={callDirection}
                isActive={isCallActive}
                onClose={handleCloseCall}
                onStateChange={handleStateChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Deck (Right Pane) */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        {/* User Selector Card */}
        <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/40 shadow-xl flex flex-col gap-4">
          <h3 className="font-bold text-base text-zinc-200 flex items-center gap-2">
            <FaCircleInfo className="text-emerald-500" /> Target Caller Profile
          </h3>
          <div className="flex flex-col gap-2">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                disabled={isCallActive}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedUser.id === user.id
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold'
                    : 'bg-zinc-800/30 border-transparent text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                } ${isCallActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-700">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs leading-none">{user.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-1">{user.phoneNumber}</span>
                  </div>
                </div>
                {selectedUser.id === user.id && <FaCheck className="text-xs text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* State Visualizer Card */}
        <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/40 shadow-xl flex flex-col gap-4">
          <h3 className="font-bold text-base text-zinc-200">Simulation Status</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block">Session</span>
              <span className="font-bold text-xs text-zinc-300 mt-1 block">
                {isCallActive ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block">Screen State</span>
              <span className="font-bold text-xs text-emerald-500 mt-1 block uppercase">
                {currentCallState}
              </span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block">Direction</span>
              <span className="font-bold text-xs text-zinc-300 mt-1 block uppercase">
                {isCallActive ? callDirection : 'n/a'}
              </span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block">Current User</span>
              <span className="font-bold text-xs text-zinc-300 mt-1 block truncate">
                {selectedUser.name}
              </span>
            </div>
          </div>

          {isCallActive && (
            <button
              onClick={handleCloseCall}
              className="w-full py-2.5 bg-rose-600/15 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 transition-all font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <FaPhoneSlash /> Terminate Call Session
            </button>
          )}
        </div>

        {/* Network Latency Simulator Card */}
        <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/40 shadow-xl flex flex-col gap-4">
          <h3 className="font-bold text-base text-zinc-200 flex items-center gap-2">
            <FaWifi className="text-emerald-500 animate-pulse" /> Latency Simulator
          </h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Simulated Latency:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{simPing} ms</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="600"
              value={simPing}
              onChange={(e) => changeSimPing(Number(e.target.value))}
              disabled={!simConnected}
              className="w-full accent-emerald-500 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            />
            
            <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800/40 mt-1">
              <span className="text-xs text-zinc-400">WebRTC Connection</span>
              <button
                onClick={() => toggleSimConnected(!simConnected)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border cursor-pointer transition-all ${
                  simConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                {simConnected ? 'Connected' : 'Disconnected'}
              </button>
            </div>
            
            <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">
              Presets
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { toggleSimConnected(true); changeSimPing(25); }}
                className="py-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/30 text-[10px] font-medium text-emerald-400 cursor-pointer text-center hover:border-emerald-500/30 transition-all"
              >
                🟢 Excellent
              </button>
              <button
                onClick={() => { toggleSimConnected(true); changeSimPing(75); }}
                className="py-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/30 text-[10px] font-medium text-yellow-400 cursor-pointer text-center hover:border-yellow-500/30 transition-all"
              >
                🟡 Good
              </button>
              <button
                onClick={() => { toggleSimConnected(true); changeSimPing(140); }}
                className="py-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/30 text-[10px] font-medium text-orange-400 cursor-pointer text-center hover:border-orange-500/30 transition-all"
              >
                🟠 Fair
              </button>
              <button
                onClick={() => { toggleSimConnected(true); changeSimPing(250); }}
                className="py-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/30 text-[10px] font-medium text-rose-400 cursor-pointer text-center hover:border-rose-500/30 transition-all"
              >
                🔴 Poor
              </button>
              <button
                onClick={() => { toggleSimConnected(true); changeSimPing(350); }}
                className="py-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/30 text-[10px] font-medium text-amber-500 cursor-pointer text-center hover:border-amber-500/30 transition-all"
              >
                ⚠️ Poor Conn
              </button>
              <button
                onClick={() => { toggleSimConnected(true); changeSimPing(550); }}
                className="py-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/30 text-[10px] font-medium text-red-500 cursor-pointer text-center hover:border-red-500/30 transition-all"
              >
                🚨 Unstable
              </button>
            </div>
            
            <button
              onClick={() => toggleSimConnected(false)}
              className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 text-[10px] font-semibold text-rose-400 cursor-pointer text-center transition-all"
            >
              Simulate Connection Lost
            </button>
          </div>
        </div>

        {/* Console Logs Card */}
        <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/40 shadow-xl flex-1 flex flex-col min-h-[220px] max-h-[300px]">
          <h3 className="font-bold text-base text-zinc-200 mb-3 flex justify-between items-center">
            <span>WebRTC Call Logger</span>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors uppercase font-bold cursor-pointer"
            >
              Clear
            </button>
          </h3>
          <div className="flex-1 bg-zinc-950 rounded-2xl border border-zinc-800/60 p-4 font-mono text-[10px] text-zinc-400 overflow-y-auto flex flex-col gap-1.5 select-text">
            {consoleLogs.length === 0 ? (
              <span className="text-zinc-600 italic">No logs generated. Trigger a call...</span>
            ) : (
              consoleLogs.map((log, index) => (
                <div key={index} className="leading-relaxed border-b border-zinc-900/20 pb-1 last:border-0 last:pb-0 break-all">
                  {log.includes('transition') ? (
                    <span className="text-amber-400">{log}</span>
                  ) : log.includes('WebRTC') ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))
            )}
            <div ref={consoleBottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallDemo;
