import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useCall } from '../Calling/CallContext';
import { 
  Search, 
  Settings, 
  Bell, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Mic, 
  Send, 
  Check, 
  CheckCheck,
  Menu,
  MessageSquare,
  Sparkles,
  LogOut,
  HelpCircle,
  Folder,
  Layers,
  ChevronRight,
  Plus,
  Bookmark,
  User,
  Trash2,
  Play,
  Pause,
  X,
  FileText,
  Download,
  PhoneOff,
  Volume2,
  VolumeX,
  Users,
  Camera,
  Globe,
  Lock,
  Shield,
  Loader2
} from 'lucide-react';
import './Chating-home.css';

// Curated list of high-quality emojis categorized for the glassmorphic picker
const emojiCategories = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😒', '😔', '🥺', '😢', '😭', '😤', '😠', '😡', '🤯', '😳', '🥵', '🥶', '😱', '🤫', '🤔', '🫣', '🤭', '🥱', '😴', '😵‍💫', '🥴', '🤢', '🤮']
  },
  {
    name: 'Gestures',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪']
  },
  {
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '🔥', '✨', '🌟', '⭐', '💫', '💥', '💯', '🎈', '🎉', '🎁']
  },
  {
    name: 'Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐮', '🐸', '🐵', '🐔', '🐧', '🐦', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐢', '🐍', '🐙', '🦑', '🐠', '🐬', '🐳', '🦈', '🐊', '🐘', '🦒', '🐐', '🐈', '🐕', '🌹', '🌸', '🌴', '🍀', '🌈']
  }
];

// Empty live chat list instead of static dummy users
const initialChats = [];

// Encapsulated voice note player with seek progress tracking and HTML5 Audio integration
const VoicePlayer = ({ src, isOutgoing = true, sending = false }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const audioRef = React.useRef(null);

  React.useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [src]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
      setIsPlaying(true);
    }
  };

  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatAudioTime = (sec) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3 py-1 px-0.5 min-w-[200px] select-none">
      <button 
        type="button"
        onClick={togglePlay}
        disabled={sending}
        className={
          isOutgoing
            ? "w-8.5 h-8.5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer select-none shrink-0"
            : "w-8.5 h-8.5 rounded-full bg-indigo-100 hover:bg-indigo-200/80 flex items-center justify-center text-indigo-600 transition-colors cursor-pointer select-none shrink-0"
        }
      >
        {sending ? (
          <Loader2 className={isOutgoing ? "w-4 h-4 text-white animate-spin" : "w-4 h-4 text-indigo-600 animate-spin"} />
        ) : isPlaying ? (
          <Pause className={isOutgoing ? "w-4 h-4 fill-white text-white" : "w-4 h-4 fill-indigo-600 text-indigo-600"} />
        ) : (
          <Play className={isOutgoing ? "w-4 h-4 fill-white text-white translate-x-[1px]" : "w-4 h-4 fill-indigo-600 text-indigo-600 translate-x-[1px]"} />
        )}
      </button>
      <div className="flex-1 flex flex-col justify-center">
        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSliderChange}
          className={
            isOutgoing
              ? "w-full accent-indigo-400 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              : "w-full accent-indigo-600 h-1 bg-slate-200/80 rounded-lg appearance-none cursor-pointer"
          }
        />
        <div className={
          isOutgoing
            ? "flex items-center justify-between text-[9px] text-white/80 mt-1 select-none font-bold font-mono"
            : "flex items-center justify-between text-[9px] text-slate-500 mt-1 select-none font-bold font-mono"
        }>
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration || 0)}</span>
        </div>
      </div>
    </div>
  );
};

// Dynamic Preloading Image Component to prevent layout shifting/reflows
const StableImageBubble = React.memo(({ src, alt, onPreviewImage, sending }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Preload in background
  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div className="w-[420px] max-w-[70vw] h-[280px] rounded-2xl overflow-hidden border border-white/20 shadow-sm cursor-pointer select-none relative flex items-center justify-center bg-white/5 backdrop-blur-[5px]">
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-500/5 backdrop-blur-[2px] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-indigo-400/20 animate-pulse" />
        </div>
      )}
      
      {/* Loaded Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 relative z-10 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => onPreviewImage(src)}
      />

      {/* Uploading Spinner Overlay */}
      {sending && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="text-[10px] text-white/95 font-bold tracking-wider uppercase select-none">Sending...</span>
          </div>
        </div>
      )}
    </div>
  );
});

// Premium Memoized Message Bubble to completely prevent unnecessary layout recalculations
const MessageBubble = React.memo(({ msg, isYou, isConsecutive, group, activeChat, onPreviewImage }) => {
  // Curated premium harmonic colors for group chat senders
  const getSenderColor = (senderId, senderName) => {
    const colors = [
      '#3b82f6', // Premium Blue (Alex)
      '#a855f7', // Premium Purple (Sarah)
      '#10b981', // Premium Emerald (Tester)
      '#f97316', // Premium Orange (Mohammed)
      '#ec4899', // Premium Pink
      '#f43f5e', // Premium Rose
      '#06b6d4', // Premium Cyan
      '#eab308'  // Premium Amber
    ];
    // Simple deterministic hashing
    const id = parseInt(senderId) || 0;
    if (id > 0) {
      return colors[id % colors.length];
    }
    const name = senderName || 'User';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const bubbleColor = getSenderColor(msg.senderId, msg.senderName);

  return (
    <motion.div
      initial={isConsecutive ? { opacity: 0, scale: 0.98 } : { opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-full ${isYou ? 'justify-end' : 'justify-start'} ${
        isConsecutive ? 'mt-0.5' : 'mt-3.5'
      }`}
    >
      <div className={`flex items-end max-w-[80%] ${isYou ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-2'}`}>
        
        {/* Optional Avatar for group chats (incoming only) */}
        {group && !isYou && (
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white font-extrabold text-[11px] overflow-hidden select-none bg-gradient-to-tr from-indigo-400 to-violet-500 shadow-sm relative">
            {!isConsecutive ? (
              msg.senderAvatar ? (
                <img src={msg.senderAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (msg.senderName || 'User').charAt(0).toUpperCase()
              )
            ) : (
              <div className="w-8 h-8 opacity-0" />
            )}
          </div>
        )}

        <div className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
          {/* Group Sender Name above the bubble (incoming only, non-consecutive only) */}
          {group && !isYou && !isConsecutive && msg.senderName && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: bubbleColor }}
              className="text-[10.5px] font-extrabold mb-1 ml-1 tracking-tight select-none"
            >
              {msg.senderName}
            </motion.span>
          )}

          {/* Message Bubble container */}
          <div 
            className={`py-2.5 px-4 text-[13.5px] leading-relaxed relative ${
              isYou ? 'msg-bubble-outgoing' : 'msg-bubble-incoming'
            } ${msg.sending ? 'opacity-70' : ''}`}
          >
            {msg.text.startsWith('data:image/') ? (
              <StableImageBubble src={msg.text} alt="Attachment" onPreviewImage={onPreviewImage} sending={msg.sending} />
            ) : msg.text.startsWith('data:audio/') ? (
              <VoicePlayer src={msg.text} isOutgoing={isYou} sending={msg.sending} />
            ) : msg.text.startsWith('data:') ? (
              <div 
                className={
                  isYou
                    ? "flex items-center space-x-3 py-1.5 px-2 bg-black/10 hover:bg-black/15 rounded-xl border border-white/20 min-w-[200px] max-w-[260px] cursor-pointer"
                    : "flex items-center space-x-3 py-1.5 px-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200/60 min-w-[200px] max-w-[260px] cursor-pointer"
                }
                onClick={() => {
                  if (msg.sending) return;
                  const link = document.createElement('a');
                  link.href = msg.text;
                  link.download = 'attachment';
                  link.click();
                }}
              >
                <div className={
                  isYou
                    ? "w-8.5 h-8.5 rounded-lg bg-indigo-500/20 flex items-center justify-center text-white shrink-0"
                    : "w-8.5 h-8.5 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"
                }>
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={
                    isYou
                      ? "text-[12px] font-bold text-white truncate leading-tight"
                      : "text-[12px] font-bold text-slate-800 truncate leading-tight"
                  }>File Attachment</p>
                  <p className={
                    isYou
                      ? "text-[9.5px] text-white/70 font-semibold mt-0.5"
                      : "text-[9.5px] text-slate-500 font-semibold mt-0.5"
                  }>Click to download</p>
                </div>
                {msg.sending ? (
                  <Loader2 className={isYou ? "w-4 h-4 text-white animate-spin shrink-0" : "w-4 h-4 text-indigo-600 animate-spin shrink-0"} />
                ) : (
                  <Download className={
                    isYou
                      ? "w-4 h-4 text-white/80 shrink-0"
                      : "w-4 h-4 text-slate-500 shrink-0"
                  } />
                )}
              </div>
            ) : (
              <p className="font-medium">{msg.text}</p>
            )}
            
            {/* Sub-label timestamp and read checkmarks inside bubble */}
            <div className="flex items-center justify-end space-x-1 mt-1 select-none opacity-80 text-[8.5px]">
              <span className={isYou ? 'text-white/80' : 'text-slate-400'}>
                {msg.timestamp}
              </span>
              {isYou && (
                <span className="text-white/90 flex items-center">
                  {msg.sending ? (
                    <Loader2 className="w-3 h-3 animate-spin text-white/70" />
                  ) : msg.error ? (
                    <span className="text-rose-400 font-extrabold text-[10px] select-none ml-0.5" title="Failed to send">⚠️</span>
                  ) : (
                    <>
                      {group || activeChat?.online ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Comparison optimization to skip rendering identical message states
  return prevProps.msg.id === nextProps.msg.id &&
         prevProps.msg.text === nextProps.msg.text &&
         prevProps.msg.sender === nextProps.msg.sender &&
         prevProps.msg.sending === nextProps.msg.sending &&
         prevProps.msg.error === nextProps.msg.error &&
         prevProps.isYou === nextProps.isYou &&
         prevProps.isConsecutive === nextProps.isConsecutive &&
         prevProps.group === nextProps.group &&
         prevProps.activeChat?.online === nextProps.activeChat?.online;
});

export default function ChatingHome() {
  const navigate = useNavigate();
  const { startCall } = useCall();
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeNav, setActiveNav] = useState('chats');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // File attachments state
  const [selectedFile, setSelectedFile] = useState(null); // { name: '', type: '', dataUrl: '', sizeString: '' }
  const fileInputRef = useRef(null);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioStreamRef = useRef(null);

  // Simulated Voice Call States
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState('ringing'); // 'ringing' | 'connected' | 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const callIntervalRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Full-screen Image Preview state
  const [previewImage, setPreviewImage] = useState(null);

  // Premium Emoji Picker states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('Smileys');

  // Realtime Socket.IO and Typing states
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Premium User Search states
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Compose dynamic modal states
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Premium Group Creation states
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [groupPrivacy, setGroupPrivacy] = useState('public');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupMemberSearchQuery, setGroupMemberSearchQuery] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeGroupStep, setActiveGroupStep] = useState(1); // 1 = Details, 2 = Members

  // Group Details Panel states
  const [showGroupInfoPanel, setShowGroupInfoPanel] = useState(false);
  const [groupInfoDetails, setGroupInfoDetails] = useState(null);
  const [loadingGroupInfo, setLoadingGroupInfo] = useState(false);
  
  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const containerRef = useRef(null);

  // Fetch registered users from backend on mount and Compose opening
  useEffect(() => {
    setLoadingUsers(true);
    axios.get(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/users`)
      .then(response => {
        setLoadingUsers(false);
        if (response.data && response.data.users) {
          setAllUsers(response.data.users);
        }
      })
      .catch(err => {
        setLoadingUsers(false);
        console.error("❌ Failed to fetch registered users:", err);
      });
  }, [showComposeModal]);

  const getLoggedInUser = () => {
    try {
      const userObj = JSON.parse(localStorage.getItem('bloop_user'));
      return userObj || { fullName: "Mohammed Yaser", username: "mohammed_yaser", id: 1 };
    } catch {
      return { fullName: "Mohammed Yaser", username: "mohammed_yaser", id: 1 };
    }
  };

  const currentUser = getLoggedInUser();

  const getInitials = (name) => {
    if (!name) return "MY";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Exclude current logged-in user dynamically for safety
  const filteredRegisteredUsers = allUsers.filter(u => {
    return u.id !== currentUser.id && u.username !== currentUser.username;
  });

  const searchResults = searchQuery.trim()
    ? filteredRegisteredUsers.filter(u => 
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const getCurrentUserId = () => {
    return currentUser.id || 1;
  };

  const fetchSearchHistory = () => {
    const userId = getCurrentUserId();
    axios.get(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/search-history`, {
      params: { userId }
    })
    .then(res => {
      if (res.data && res.data.history) {
        setRecentSearches(res.data.history.map(item => ({
          ...item,
          online: item.isOnline === 1,
          bio: item.bio || "Available on Bloop 🦄",
          mutualCount: item.mutualCount || Math.floor(Math.random() * 5) + 1
        })));
      }
    })
    .catch(err => {
      console.error("❌ Failed to fetch search history from DB:", err);
    });
  };

  const fetchConversations = () => {
    const userId = getCurrentUserId();
    axios.get(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/conversations/${userId}`)
      .then(response => {
        if (response.data && response.data.conversations) {
          const mapped = response.data.conversations.map(c => ({
            id: c.id,
            otherUserId: c.otherUserId,
            name: c.fullName,
            username: c.username,
            avatar: c.avatar || c.fullName.charAt(0).toUpperCase(),
            avatarColor: c.avatarColor || gradients[c.id % gradients.length],
            online: c.isOnline === 1,
            lastSeen: c.isOnline === 1 ? 'Online' : 'Offline',
            lastMessage: c.lastMessage,
            timestamp: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            unreadCount: c.unreadCount || 0,
            group: c.group || false,
            messages: []
          }));
          setChats(prevChats => {
            return mapped.map(newChat => {
              const existingChat = prevChats.find(pc => pc.id === newChat.id);
              return {
                ...newChat,
                unreadCount: (activeChatIdRef.current && String(newChat.id) === String(activeChatIdRef.current)) 
                  ? 0 
                  : (newChat.unreadCount || 0),
                messages: existingChat ? existingChat.messages : []
              };
            });
          });
        }
      })
      .catch(err => {
        console.error("❌ Failed to fetch user conversations:", err);
      });
  };

  // Pre-fetch search history, live database users, and conversations on mount
  useEffect(() => {
    fetchSearchHistory();
    fetchConversations();
    axios.get(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/users`)
      .then(response => {
        if (response.data && response.data.users) {
          setAllUsers(response.data.users);
        }
      })
      .catch(err => {
        console.error("❌ Failed to pre-fetch registered users from DB:", err);
      });
  }, []);

  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    setOtherUserTyping(false); // Reset typing indicator immediately when conversation switches
  }, [activeChatId]);

  // Initialize Socket.IO connection exactly once on mount
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      const userId = getCurrentUserId();
      if (userId) {
        socket.emit('join-user-room', userId);
      }
    });

    socket.on('typing-start', (data) => {
      if (activeChatIdRef.current && Number(data.conversationId) === Number(activeChatIdRef.current)) {
        setOtherUserTyping(true);
      }
    });

    socket.on('typing-stop', (data) => {
      if (activeChatIdRef.current && Number(data.conversationId) === Number(activeChatIdRef.current)) {
        setOtherUserTyping(false);
      }
    });

    socket.on('user-online', (data) => {
      console.log('🟢 Socket presence: user online', data);
      const onlineUserId = Number(data.userId);
      setChats(prevChats => 
        prevChats.map(chat => {
          if (Number(chat.otherUserId) === onlineUserId) {
            return {
              ...chat,
              online: true,
              lastSeen: 'Online'
            };
          }
          return chat;
        })
      );
    });

    socket.on('user-offline', (data) => {
      console.log('🔴 Socket presence: user offline', data);
      const offlineUserId = Number(data.userId);
      setChats(prevChats => 
        prevChats.map(chat => {
          if (Number(chat.otherUserId) === offlineUserId) {
            return {
              ...chat,
              online: false,
              lastSeen: 'Offline'
            };
          }
          return chat;
        })
      );
    });

    socket.on('active-users', (activeUserIds) => {
      console.log('👥 Active users list updated:', activeUserIds);
      const activeIdsMapped = activeUserIds.map(Number);
      setChats(prevChats =>
        prevChats.map(chat => {
          const isUserOnline = activeIdsMapped.includes(Number(chat.otherUserId));
          return {
            ...chat,
            online: isUserOnline,
            lastSeen: isUserOnline ? 'Online' : 'Offline'
          };
        })
      );
    });
    socket.on('new-message', (data) => {
      console.log('✉️ Socket: new message received', data);
      const { message, conversationId } = data;
      
      // If this conversation is currently active, append immediately and mark as read
      if (activeChatIdRef.current && String(conversationId) === String(activeChatIdRef.current)) {
        const formattedMsg = {
          id: message.id,
          text: message.text,
          sender: 'them',
          senderId: message.senderId,
          senderName: message.senderName || 'User',
          senderAvatar: message.senderAvatar,
          senderAvatarColor: message.senderAvatarColor,
          timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChats(prevChats => 
          prevChats.map(chat => {
            if (chat.id === conversationId) {
              const displayMsg = message.text.startsWith('data:') 
                ? (message.text.startsWith('data:image/') ? '📷 Photo' : '🎵 Voice note') 
                : message.text;
              return {
                ...chat,
                lastMessage: displayMsg,
                timestamp: formattedMsg.timestamp,
                messages: [...chat.messages, formattedMsg],
                unreadCount: 0
              };
            }
            return chat;
          })
        );
        
        // Auto-mark as read
        const userId = getCurrentUserId();
        axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/messages/read`, {
          conversationId,
          userId
        }).then(() => {
          if (socketRef.current) {
            socketRef.current.emit('message-read', { conversationId, userId });
          }
        }).catch(err => console.error("❌ Failed to auto-read new message:", err));
      } else {
        // If not active, increment unread count
        setChats(prevChats => 
          prevChats.map(chat => {
            if (chat.id === conversationId) {
              const displayMsg = message.text.startsWith('data:') 
                ? (message.text.startsWith('data:image/') ? '📷 Photo' : '🎵 Voice note') 
                : message.text;
              return {
                ...chat,
                lastMessage: displayMsg,
                timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unreadCount: (chat.unreadCount || 0) + 1
              };
            }
            return chat;
          })
        );
      }
    });

    socket.on('message-read', (data) => {
      console.log('👁️ Socket: message-read received', data);
      const { conversationId } = data;
      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === conversationId) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        })
      );
    });

    return () => {
      socket.off('connect');
      socket.off('typing-start');
      socket.off('typing-stop');
      socket.off('user-online');
      socket.off('user-offline');
      socket.off('active-users');
      socket.off('new-message');
      socket.off('message-read');
      socket.disconnect();
    };
  }, []);

  const handleMarkAsRead = (chatId) => {
    if (!chatId) return;
    const userId = getCurrentUserId();
    axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/messages/read`, {
      conversationId: chatId,
      userId
    })
    .then(() => {
      setChats(prevChats => 
        prevChats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c)
      );
      if (socketRef.current) {
        socketRef.current.emit('message-read', {
          conversationId: chatId,
          userId
        });
      }
    })
    .catch(err => {
      console.error("❌ Failed to mark conversation as read:", err);
    });
  };

  // Real-time message & conversation presence synchronizer (3s poll)
  useEffect(() => {
    fetchConversations();
    if (activeChatId) {
      handleMarkAsRead(activeChatId);
      // Pre-fetch active group details to populate header and info panel
      if (String(activeChatId).startsWith('group_')) {
        const gId = parseInt(String(activeChatId).replace('group_', ''));
        fetchGroupInfo(gId);
      }
    }

    const fetchActiveChatMessages = (isFirstFetch = false) => {
      if (activeChatId) {
        if (isFirstFetch) {
          setLoadingMessages(true);
          setIsTyping(true);
        }
        const userId = getCurrentUserId();
        axios.get(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/messages/${activeChatId}`)
          .then(response => {
            if (response.data && response.data.messages) {
              const messagesMapped = response.data.messages.map(m => ({
                id: m.id,
                text: m.text,
                sender: m.senderId === userId ? 'you' : 'them',
                senderId: m.senderId,
                senderName: m.senderName,
                senderAvatar: m.senderAvatar,
                senderAvatarColor: m.senderAvatarColor,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }));

              setChats(prevChats => 
                prevChats.map(chat => {
                  if (chat.id === activeChatId) {
                    return {
                      ...chat,
                      messages: messagesMapped
                    };
                  }
                  return chat;
                })
              );
            }
          })
          .catch(err => {
            console.error("❌ Failed to sync messages dynamically:", err);
          })
          .finally(() => {
            if (isFirstFetch) {
              setLoadingMessages(false);
              setIsTyping(false);
            }
          });
      }
    };

    // Immediately fetch messages on active chat selection/change
    fetchActiveChatMessages(true);

    const interval = setInterval(() => {
      fetchConversations();
      fetchActiveChatMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChatId]);

  const handleClearRecentSearches = (e) => {
    e.stopPropagation();
    const userId = getCurrentUserId();
    axios.delete(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/search-history`, {
      params: { userId }
    })
    .then(() => {
      setRecentSearches([]);
    })
    .catch(err => {
      console.error("❌ Failed to clear search history in DB:", err);
    });
  };

  const gradients = [
    'from-teal-400 to-emerald-400',
    'from-cyan-400 to-sky-500',
    'from-indigo-400 to-violet-500',
    'from-pink-400 to-rose-400',
    'from-amber-400 to-orange-400',
    'from-fuchsia-400 to-purple-500'
  ];

  const handleSearchSelect = (user) => {
    const userId = getCurrentUserId();

    // Save search history entry to database
    axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/search-history`, {
      userId,
      searchedUserId: user.id
    })
    .then(() => {
      fetchSearchHistory();
    })
    .catch(err => {
      console.error("❌ Failed to save search history to DB:", err);
    });

    // Start a loading indicator for starting conversation
    setIsStartingChat(user.id);

    // Call POST /conversations to check/create the conversation in DB
    axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/conversations`, {
      senderId: userId,
      receiverId: user.id
    })
    .then(response => {
      if (response.data && response.data.conversationId) {
        const convId = response.data.conversationId;
        
        // Immediately fetch conversations to populate sidebar
        fetchConversations();
        
        // Set the active conversation ID
        setActiveChatId(convId);
      }
    })
    .catch(err => {
      console.error("❌ Failed to check/create conversation:", err);
    })
    .finally(() => {
      setIsStartingChat(null);
      setIsSearchFocused(false);
      setSearchQuery('');
    });
  };

  const startNewChat = (user) => {
    const userId = getCurrentUserId();
    
    // Call POST /conversations to check/create the conversation in DB
    axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/conversations`, {
      senderId: userId,
      receiverId: user.id
    })
    .then(response => {
      if (response.data && response.data.conversationId) {
        const convId = response.data.conversationId;
        fetchConversations();
        setActiveChatId(convId);
      }
    })
    .catch(err => {
      console.error("❌ Failed to check/create conversation from compose modal:", err);
    })
    .finally(() => {
      setShowComposeModal(false);
    });
  };

  const handleGroupAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    if (selectedMembers.length === 0) return;

    setIsCreatingGroup(true);
    const loggedInUser = getCurrentUserId();
    const payload = {
      name: groupName.trim(),
      description: groupDescription.trim(),
      avatar: groupAvatar,
      created_by: loggedInUser,
      is_private: groupPrivacy === 'private' ? 1 : 0,
      members: selectedMembers.map(m => m.id)
    };

    axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/groups`, payload)
      .then(response => {
        if (response.data && response.data.success) {
          const newGroup = response.data.group;
          fetchConversations();
          setActiveChatId(newGroup.id);
          setShowCreateGroupModal(false);
          setGroupName('');
          setGroupDescription('');
          setGroupAvatar('');
          setSelectedMembers([]);
          setActiveGroupStep(1);
        }
      })
      .catch(err => {
        console.error("❌ Failed to create group:", err);
      })
      .finally(() => {
        setIsCreatingGroup(false);
      });
  };

  const fetchGroupInfo = (groupId) => {
    setLoadingGroupInfo(true);
    axios.get(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/groups/${groupId}/info`)
      .then(response => {
        if (response.data && response.data.success) {
          setGroupInfoDetails(response.data.group);
        }
      })
      .catch(err => {
        console.error("❌ Failed to fetch group info:", err);
      })
      .finally(() => {
        setLoadingGroupInfo(false);
      });
  };

  const handleLeaveGroup = (groupId) => {
    const userId = getCurrentUserId();
    axios.delete(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/groups/${groupId}/members/${userId}`)
      .then(() => {
        fetchConversations();
        setActiveChatId(null);
        setShowGroupInfoPanel(false);
      })
      .catch(err => {
        console.error("❌ Failed to leave group:", err);
      });
  };

  const handleDeleteGroup = (groupId) => {
    const userId = getCurrentUserId();
    axios.delete(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/groups/${groupId}`, {
      data: { userId }
    })
      .then(() => {
        fetchConversations();
        setActiveChatId(null);
        setShowGroupInfoPanel(false);
      })
      .catch(err => {
        console.error("❌ Failed to delete group:", err);
      });
  };

  // Ensure the page and the main container are never scrolled and stay perfectly locked at (0,0)
  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
        containerRef.current.scrollLeft = 0;
      }
      window.scrollTo(0, 0);
    };
    
    // Lock both window scroll and container scroll
    window.addEventListener('scroll', handleScroll);
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (el) {
        el.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Auto-scroll to bottom of chats on new message or chat change
  useEffect(() => {
    if (activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, activeChat?.messages?.length]);

  // Handle input message change with debounced Socket.IO typing indicators
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputMessage(val);

    if (!activeChat) return;

    // Emit typing-start event if not already typing
    if (!isCurrentUserTyping) {
      setIsCurrentUserTyping(true);
      if (socketRef.current) {
        socketRef.current.emit('typing-start', {
          conversationId: activeChatId,
          senderId: currentUser.id,
          receiverId: activeChat.otherUserId
        });
      }
    }

    // Debounce the typing-stop event
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsCurrentUserTyping(false);
      if (socketRef.current) {
        socketRef.current.emit('typing-stop', {
          conversationId: activeChatId,
          senderId: currentUser.id,
          receiverId: activeChat.otherUserId
        });
      }
    }, 1500);
  };

  // --- File Attachment & Paperclip Selector ---
  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      let sizeStr = "";
      if (file.size < 1024) sizeStr = `${file.size} B`;
      else if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      else sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setSelectedFile({
        name: file.name,
        type: file.type,
        sizeString: sizeStr,
        dataUrl: loadEvent.target.result
      });
      // Pre-fill input block to give user context
      setInputMessage(`Sending file: ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset target value
  };

  // --- HTML5 MediaRecorder Voice Note Functions ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result;
          sendPayloadMessage(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("❌ Failed to access microphone for voice message:", err);
      alert("Microphone permission denied. Please allow microphone access to record voice notes.");
    }
  };

  const stopRecordingAndSend = (shouldSend = true) => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    if (!shouldSend) {
      // Discard recorded file bytes
      mediaRecorderRef.current.onstop = () => {};
    }

    mediaRecorderRef.current.stop();

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    setRecordingDuration(0);
  };

  // --- Simulated Glassmorphic Calling Engine ---
  const startSimulatedCall = (type = 'voice') => {
    if (!activeChat) return;
    setShowCallModal(true);
    setCallStatus('ringing');
    setCallDuration(0);

    // Connect call automatically after 3 seconds
    setTimeout(() => {
      setCallStatus('connected');
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 3000);
  };

  const endSimulatedCall = () => {
    setCallStatus('ended');
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
    }
    setTimeout(() => {
      setShowCallModal(false);
      setCallStatus('ringing');
      setCallDuration(0);
    }, 1200);
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Unified Payload Message Dispatcher ---
  const sendPayloadMessage = (contentString) => {
    if (!activeChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isCurrentUserTyping) {
      setIsCurrentUserTyping(false);
      if (socketRef.current) {
        socketRef.current.emit('typing-stop', {
          conversationId: activeChatId,
          senderId: currentUser.id,
          receiverId: activeChat.otherUserId
        });
      }
    }

    const senderId = getCurrentUserId();
    const conversationId = activeChatId;

    const isMedia = contentString.startsWith('data:');
    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const optimisticMessage = {
      id: tempId,
      text: contentString,
      sender: 'you',
      senderId: senderId,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatar,
      senderAvatarColor: currentUser.avatarColor,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sending: true
    };

    // Pre-emptively reset the chat bar immediately
    if (isMedia) {
      setSelectedFile(null);
    }
    setInputMessage('');
    setShowEmojiPicker(false);

    // Immediately display in chat UI
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === activeChatId) {
          let displayMsg = contentString;
          if (contentString.startsWith('data:image/')) displayMsg = '📷 Photo';
          else if (contentString.startsWith('data:audio/')) displayMsg = '🎵 Voice note';
          else if (contentString.startsWith('data:')) displayMsg = '📁 Attachment';

          return {
            ...chat,
            lastMessage: displayMsg,
            timestamp: optimisticMessage.timestamp,
            messages: [...chat.messages, optimisticMessage]
          };
        }
        return chat;
      })
    );

    axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/messages`, {
      senderId,
      conversationId,
      text: contentString
    })
    .then(response => {
      if (response.status === 201) {
        const msg = response.data.newMessage;
        
        // Emit socket event for zero-lag realtime delivery
        if (socketRef.current) {
          socketRef.current.emit('new-message', {
            message: msg,
            conversationId: activeChatId,
            senderId: currentUser.id,
            receiverId: activeChat.otherUserId,
            group: activeChat.group
          });
        }

        const newMessage = {
          id: msg.id,
          text: msg.text,
          sender: 'you',
          senderId: msg.senderId,
          senderName: msg.senderName || currentUser.fullName,
          senderAvatar: msg.senderAvatar || currentUser.avatar,
          senderAvatarColor: msg.senderAvatarColor || currentUser.avatarColor,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sending: false
        };

        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.id === activeChatId) {
              const updatedMessages = chat.messages.map(m => 
                m.id === tempId ? newMessage : m
              );
              return {
                ...chat,
                messages: updatedMessages
              };
            }
            return chat;
          })
        );
      }
    })
    .catch(err => {
      console.error("❌ Failed to send payload message:", err);
      // Mark as error
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === activeChatId) {
            const updatedMessages = chat.messages.map(m => 
              m.id === tempId ? { ...m, sending: false, error: true } : m
            );
            return {
              ...chat,
              messages: updatedMessages
            };
          }
          return chat;
        })
      );
    });
  };

  // Handle standard message submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!activeChat) return;

    if (selectedFile) {
      sendPayloadMessage(selectedFile.dataUrl);
    } else {
      if (!inputMessage.trim()) return;
      sendPayloadMessage(inputMessage);
    }
  };

  // Filter chats by search and category
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          chat.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'All') return matchesSearch;
    if (activeCategory === 'Unread') return matchesSearch && chat.unreadCount > 0;
    if (activeCategory === 'Groups') return matchesSearch && chat.group;
    return matchesSearch;
  });

  // Filter live users in Compose modal
  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="seamless-chat-bg fixed inset-0 w-full h-dvh overflow-hidden select-none z-50 flex flex-col justify-start items-stretch">
      
      {/* Giant Animated Glow Mesh Spheres */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-violet-300/10 blur-[130px] pointer-events-none -z-10 animate-float-1" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full bg-cyan-200/15 blur-[120px] pointer-events-none -z-10 animate-float-2" />
      <div className="absolute top-[35%] right-[25%] w-[400px] h-[400px] rounded-full bg-peach-300/10 blur-[110px] pointer-events-none -z-10 animate-float-3" />

      {/* Floating sparkles across layout */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute w-2 h-2 rounded-full bg-violet-400/40 left-[15%] top-[25%] particle" style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/30 left-[80%] top-[35%] particle" style={{ animationDelay: '2.5s', animationDuration: '9s' }} />
      </div>

      {/* Main Glass Dashboard Shell - Centered & Fitted Full-screen */}
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass-panel absolute inset-0 w-full h-dvh overflow-hidden flex flex-row z-10 border-none"
      >
        
        {/* ================= COLUMN 1: LEFT NAVIGATION SIDEBAR (Slim Vertical) ================= */}
        <div className="w-[76px] h-full left-sidebar-col border-r border-slate-200/40 flex flex-col items-center justify-between py-6 bg-white/15 backdrop-blur-[15px] z-20 shrink-0 select-none">
          
          {/* Top Logo & Branding */}
          <div className="flex flex-col items-center space-y-2">
            <motion.div 
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-300/30 cursor-pointer relative"
            >
              <MessageSquare className="w-5.5 h-5.5 text-white" />
              {/* Soft neon ambient backglow */}
              <div className="absolute inset-0 rounded-2xl bg-violet-400/20 blur-md -z-10" />
            </motion.div>
            
            <span className="text-[10px] font-extrabold tracking-widest text-indigo-500 uppercase select-none font-mono mt-0.5">
              Bloop
            </span>

            {/* Glowing Accent divider */}
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-slate-300/50 to-transparent mt-2" />
          </div>

          {/* Navigation Menu Items */}
          <div className="flex-1 w-full flex flex-col items-center justify-center space-y-4 px-2">
            {[
              { id: 'chats', label: 'Chats', icon: MessageSquare },
              { id: 'groups', label: 'Groups', icon: Layers },
              { id: 'calls', label: 'Calls', icon: Phone },
              { id: 'contacts', label: 'Contacts', icon: User },
              { id: 'saved', label: 'Saved', icon: Bookmark },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center relative cursor-pointer group transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-tr from-violet-500/10 to-cyan-500/10 border border-slate-200/50 text-indigo-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Label tooltip on hover */}
                  <div className="absolute left-[70px] bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-30">
                    {item.label}
                  </div>

                  {/* Active Indicator Glow Pip */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute right-[-4px] w-1.5 h-6 rounded-l-md bg-gradient-to-b from-violet-500 to-cyan-500" 
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Bottom Section: Profile, Pro Plan & Actions */}
          <div className="flex flex-col items-center space-y-5 w-full px-2">
            
            {/* Upgrade Plan Micro-Card Tooltip/Trigger */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={() => alert('Bloop Pro features (simulated): Custom animated themes, custom bots, unlimited database sync.')}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/10 to-orange-400/10 border border-amber-300/40 flex items-center justify-center text-amber-500 cursor-pointer relative group"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <div className="absolute left-[70px] bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[10.5px] font-extrabold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-amber-400/20 z-30">
                Go Premium ⭐
              </div>
            </motion.div>
            
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-slate-300/50 to-transparent" />

            {/* Profile Avatar Card with Pulse Ring */}
            <div className="relative select-none">
              <div 
                onClick={() => navigate('/profile')}
                className={`w-11 h-11 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-sky-400 to-indigo-500'} text-white flex items-center justify-center font-bold text-[14px] shadow-sm relative cursor-pointer hover:scale-105 transition-transform overflow-hidden`}
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(currentUser.fullName)
                )}
                {/* Green active status pulse indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full z-10"></span>
              </div>
              
              {/* Profile Details Overlay on Click */}
              {showProfileMenu && (
                <>
                  {/* Transparent click-outside backdrop */}
                  <div 
                    className="fixed inset-0 z-20 cursor-default" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  
                  <div className="absolute left-[70px] bottom-0 bg-white/95 backdrop-blur-md border border-slate-200/50 p-3 rounded-2xl shadow-xl whitespace-nowrap z-30 animate-in fade-in slide-in-from-left-2 duration-200">
                    <p className="text-[12px] font-bold text-slate-800">{currentUser.fullName}</p>
                    <p className="text-[10px] text-slate-400">@{currentUser.username}</p>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">Online</span>
                      <button 
                        onClick={() => {
                          if (confirm('Log out from Bloop session?')) {
                            const userId = getCurrentUserId();
                            axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/logout`, { userId })
                              .finally(() => {
                                localStorage.removeItem('bloop_user');
                                window.location.href = '/login';
                              });
                          }
                        }} 
                        className="text-[10px] text-rose-500 hover:text-rose-600 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

        {/* ================= COLUMN 2: MIDDLE CHAT LIST SIDEBAR (Telegram Web Style) ================= */}
        <div className="w-[340px] h-full middle-sidebar-col border-r border-slate-200/40 flex flex-col overflow-hidden bg-white/10 backdrop-blur-[10px] shrink-0 z-10">
          
          {/* Stack-safe click-away backdrop */}
          {isSearchFocused && (
            <div 
              className="fixed inset-0 z-30 cursor-default bg-transparent" 
              onClick={() => setIsSearchFocused(false)} 
            />
          )}

          {/* Header Area */}
          <div className="pt-6 pb-4 px-4 flex flex-col space-y-4">
            
            {/* Title / Header Label */}
            <div className="flex items-center justify-between relative">
              <span className="text-[18px] font-extrabold tracking-tight text-slate-800 bg-clip-text">
                Messages
              </span>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500/10 to-cyan-500/10 border border-slate-200/40 flex items-center justify-center text-indigo-600 shadow-sm cursor-pointer hover:bg-slate-100/40 transition-colors"
                >
                  <Plus className={`w-4.5 h-4.5 transition-transform duration-300 ${showPlusMenu ? 'rotate-45 text-rose-500' : ''}`} />
                </motion.button>

                {/* Glassmorphism Action Dropdown Menu */}
                <AnimatePresence>
                  {showPlusMenu && (
                    <>
                      {/* Click-away backdrop */}
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowPlusMenu(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-[45px] w-48 bg-white/90 backdrop-blur-[20px] border border-white/60 rounded-2xl shadow-xl shadow-slate-200/40 p-1.5 z-50 flex flex-col"
                      >
                        <button
                          onClick={() => {
                            setShowPlusMenu(false);
                            setShowComposeModal(true);
                          }}
                          className="flex items-center space-x-2.5 px-3 py-2.5 text-[12px] font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-500/5 rounded-xl cursor-pointer transition-colors text-left"
                        >
                          <MessageSquare className="w-4 h-4 text-indigo-500" />
                          <span>New Chat</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowPlusMenu(false);
                            setShowCreateGroupModal(true);
                            setActiveGroupStep(1);
                          }}
                          className="flex items-center space-x-2.5 px-3 py-2.5 text-[12px] font-bold text-slate-700 hover:text-violet-600 hover:bg-slate-500/5 rounded-xl cursor-pointer transition-colors text-left"
                        >
                          <Users className="w-4 h-4 text-violet-500" />
                          <span>New Group</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowPlusMenu(false);
                            alert("📣 Channels feature is coming soon!");
                          }}
                          className="flex items-center space-x-2.5 px-3 py-2.5 text-[12px] font-bold text-slate-400 hover:bg-transparent rounded-xl cursor-not-allowed transition-colors text-left"
                        >
                          <Volume2 className="w-4 h-4 text-slate-300" />
                          <span>New Channel</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Premium Pill Search Box Container */}
            <div className="premium-search-container relative z-40">
              <div className="relative flex items-center">
                <Search className={`absolute left-4.5 w-4 h-4 transition-colors duration-300 pointer-events-none ${isSearchFocused ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search users, chats, groups..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="premium-search-input font-medium"
                />
                
                {/* Typing/Searching feedback pulse indicator */}
                {searchQuery.trim() && isSearchFocused && (
                  <span className="absolute right-4 flex h-2 w-2 select-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
              </div>

              {/* Floating Results Panel */}
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="premium-search-results-panel custom-scrollbar z-[100]"
                  >
                    {/* Glowing background highlights */}
                    <div className="premium-search-panel-glow-1" />
                    <div className="premium-search-panel-glow-2" />

                    {searchQuery.trim() ? (
                      // Search Results Feed
                      <div>
                        <div className="premium-search-section-header">
                          <span>Search Results ({searchResults.length})</span>
                        </div>
                        
                        {searchResults.length > 0 ? (
                          <div className="space-y-1">
                            {searchResults.map(user => (
                              <motion.div
                                key={user.id}
                                onClick={() => handleSearchSelect(user)}
                                whileHover={{ scale: 1.02, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                className="premium-search-result-card group"
                              >
                                <div className="premium-search-avatar bg-gradient-to-tr from-violet-400 via-pink-400 to-cyan-400 font-extrabold shadow-sm relative overflow-hidden flex items-center justify-center">
                                  {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    user.fullName.charAt(0).toUpperCase()
                                  )}
                                  <span className={`premium-status-indicator ${user.online ? 'online' : 'offline'} z-10`} />
                                </div>
                                
                                <div className="ml-3 flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-[12.5px] font-bold text-slate-800 truncate">
                                      {user.fullName}
                                      {(user.id === currentUser.id || user.username === currentUser.username) && (
                                        <span className="text-indigo-500 font-bold ml-1">(You)</span>
                                      )}
                                    </h4>
                                    <span className="text-[9.5px] text-slate-400 font-medium">@{user.username || 'user'}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.bio || 'Available on Bloop 🦄'}</p>
                                  
                                  {/* Mutual connection details */}
                                  <div className="flex items-center space-x-1 mt-1 text-[8.5px] text-indigo-400 font-bold tracking-tight">
                                    <span>✨</span>
                                    <span>{user.mutualCount || Math.floor(Math.random() * 4) + 1} mutual connections</span>
                                  </div>
                                </div>
                                
                                <div className="ml-2 shrink-0">
                                  {isStartingChat === user.id ? (
                                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          // Premium Empty State
                          <div className="premium-search-empty py-8 text-center">
                            <motion.div 
                              animate={{ y: [0, -6, 0] }}
                              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                              className="w-12 h-12 rounded-2xl bg-indigo-50/70 border border-indigo-150 flex items-center justify-center text-indigo-500 mb-3 mx-auto shadow-sm"
                            >
                              <User className="w-6 h-6 animate-pulse" />
                            </motion.div>
                            <h5 className="text-[13px] font-bold text-slate-700">No users found</h5>
                            <p className="text-[10.5px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                              We couldn't find anyone matching "<strong>{searchQuery}</strong>". Try another username!
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Default focused feed: ONLY Search History from Database
                      <div className="space-y-4">
                        <div>
                          <div className="premium-search-section-header">
                            <span>Search History</span>
                            {recentSearches.length > 0 && (
                              <span 
                                onClick={handleClearRecentSearches}
                                className="premium-search-clear-all"
                              >
                                Clear All
                              </span>
                            )}
                          </div>
                          
                          {recentSearches.length > 0 ? (
                            <div className="space-y-1">
                              {recentSearches.map(user => (
                                <motion.div
                                  key={`recent-${user.id}`}
                                  onClick={() => handleSearchSelect(user)}
                                  whileHover={{ scale: 1.02, x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="premium-search-result-card group"
                                >
                                  <div className="premium-search-avatar bg-gradient-to-tr from-cyan-400 to-sky-500 font-extrabold shadow-sm relative overflow-hidden flex items-center justify-center">
                                    {user.avatar ? (
                                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      user.fullName.charAt(0).toUpperCase()
                                    )}
                                    <span className={`premium-status-indicator ${user.online ? 'online' : 'offline'} z-10`} />
                                  </div>
                                  
                                  <div className="ml-3 flex-1 min-w-0">
                                    <h4 className="text-[12.5px] font-bold text-slate-800 truncate">
                                      {user.fullName}
                                      {(user.id === currentUser.id || user.username === currentUser.username) && (
                                        <span className="text-indigo-500 font-bold ml-1">(You)</span>
                                      )}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 truncate mt-0.5">@{user.username || 'user'}</p>
                                  </div>
                                  
                                  <div className="ml-2 shrink-0">
                                    {isStartingChat === user.id ? (
                                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-slate-400 font-semibold text-[11px] select-none italic bg-slate-50/50 rounded-xl border border-slate-100/30">
                              No recent searches. Start searching to save history!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat Category Tabs */}
          <div className="px-4 pb-2">
            <div className="flex items-center space-x-1 border-b border-slate-100/50 pb-1">
              {['All', 'Unread', 'Groups'].map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="relative px-3 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer select-none rounded-lg text-slate-500 hover:text-slate-700"
                  >
                    <span className={isActive ? 'text-indigo-600 font-bold' : ''}>
                      {cat}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeCategoryBar"
                        className="absolute bottom-[-5px] left-0 right-0 h-0.5 category-active-bar rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List Scroll Feed */}
          <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar space-y-1">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const isSelected = chat.id === activeChatId;
                return (
                  <motion.div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      handleMarkAsRead(chat.id);
                    }}
                    whileHover={{ x: 2 }}
                    className={`glass-card p-3 rounded-2xl flex items-center space-x-3 cursor-pointer select-none relative ${
                      isSelected ? 'active' : ''
                    } ${chat.unreadCount > 0 ? 'bg-indigo-500/5 border-indigo-500/20' : ''}`}
                  >
                    
                    {/* User Avatar with dynamic gradient and online status indicator */}
                    <div className="relative select-none shrink-0">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${chat.group ? 'from-violet-500 to-indigo-600' : chat.avatarColor} text-white flex items-center justify-center font-bold text-[14.5px] shadow-sm relative overflow-hidden`}>
                        {chat.avatar && (chat.avatar.startsWith('data:image') || chat.avatar.includes('/') || chat.avatar.length > 2) ? (
                          <img src={chat.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          chat.group ? <span className="text-[17px]">👥</span> : (chat.avatar || getInitials(chat.fullName || chat.name))
                        )}
                      </div>
                      {chat.online && !chat.group && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white z-10"></span>
                      )}
                    </div>

                    {/* Chat Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className={`text-[13px] flex items-center truncate ${chat.unreadCount > 0 ? 'font-extrabold text-slate-900' : 'font-bold text-slate-800'}`}>
                          {chat.group && <span className="text-violet-500 mr-1 text-[13px] select-none">👥</span>}
                          <span className="truncate">{chat.fullName || chat.name}</span>
                          {chat.unreadCount === 1 && (
                            <span className="unread-pulse-dot ml-1.5 shrink-0" />
                          )}
                          {(chat.username === currentUser.username) && (
                            <span className="text-indigo-500 font-bold ml-1 shrink-0">(You)</span>
                          )}
                        </h4>
                        <span className={`text-[9.5px] font-medium ${chat.unreadCount > 0 ? 'text-indigo-500 font-bold' : 'text-slate-400'}`}>
                          {chat.timestamp || (chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                        </span>
                      </div>
                      
                      <p className={`text-[11.5px] truncate pr-2 flex items-center ${chat.unreadCount > 0 ? 'font-extrabold text-slate-900' : 'text-slate-500'}`}>
                        {chat.lastMessage && chat.lastMessage.startsWith('data:image/') ? (
                          <span className={`flex items-center font-bold text-[10.5px] select-none ${chat.unreadCount > 0 ? 'text-indigo-600' : 'text-indigo-500/90'}`}>
                            <span className="mr-1">📷</span> Photo
                          </span>
                        ) : chat.lastMessage && chat.lastMessage.startsWith('data:audio/') ? (
                          <span className={`flex items-center font-bold text-[10.5px] select-none ${chat.unreadCount > 0 ? 'text-cyan-600' : 'text-cyan-500/90'}`}>
                            <span className="mr-1">🎙️</span> Voice note
                          </span>
                        ) : chat.lastMessage && chat.lastMessage.startsWith('data:') ? (
                          <span className={`flex items-center font-bold text-[10.5px] select-none ${chat.unreadCount > 0 ? 'text-slate-900' : 'text-slate-500/90'}`}>
                            <span className="mr-1">📁</span> Attachment
                          </span>
                        ) : (
                          chat.lastMessage
                        )}
                      </p>
                    </div>

                    {/* Unread Message Badge */}
                    {chat.unreadCount > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="shrink-0 ml-2"
                      >
                        {chat.unreadCount === 1 ? (
                          <div className="unread-pulse-dot" title="1 unread message" />
                        ) : (
                          <div className="unread-pill-badge">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Left border glowing accent */}
                    {isSelected && (
                      <motion.div 
                        layoutId="active-chat-glow" 
                        className="absolute left-0 top-[20%] bottom-[20%] w-1 rounded-r-full category-active-bar"
                      />
                    )}

                  </motion.div>
                );
              })
            ) : chats.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 font-semibold text-[12px] select-none flex flex-col items-center justify-center space-y-3">
                <MessageSquare className="w-8 h-8 text-indigo-500/40 animate-pulse" />
                <span>No active conversations. Click plus to start chatting!</span>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 font-medium text-[12px] select-none">
                No chats found matching your search.
              </div>
            )}
          </div>

        </div>

        {/* ================= COLUMN 3: RIGHT ACTIVE CHAT SECTION ================= */}
        <div className="flex-1 h-full right-chat-col flex flex-col overflow-hidden bg-white/20 backdrop-blur-[5px] relative">
          
          {activeChat ? (
            <>
              {/* Header Panel */}
              <div className="pt-6 pb-4 px-4 border-b border-slate-200/50 flex items-center justify-between bg-white/10 z-10">
                
                {/* Active profile text */}
                <div 
                  className={`flex items-center space-x-3 select-none ${activeChat.group ? 'cursor-pointer hover:opacity-90' : ''}`}
                  onClick={() => {
                    if (activeChat.group) {
                      const gId = activeChat.groupId || activeChat.id.replace('group_', '');
                      fetchGroupInfo(gId);
                      setShowGroupInfoPanel(true);
                    }
                  }}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${activeChat.group ? 'from-violet-500 to-indigo-600' : activeChat.avatarColor} text-white flex items-center justify-center font-bold text-[14px] shadow-sm overflow-hidden`}>
                    {activeChat.avatar && (activeChat.avatar.startsWith('data:image') || activeChat.avatar.includes('/') || activeChat.avatar.length > 2) ? (
                      <img src={activeChat.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      activeChat.group ? <span className="text-[15px]">👥</span> : (activeChat.avatar || getInitials(activeChat.fullName || activeChat.name))
                    )}
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-bold text-slate-800 leading-tight flex items-center">
                      {activeChat.group && <span className="text-violet-500 mr-1 text-[13.5px] select-none">👥</span>}
                      <span>{activeChat.fullName || activeChat.name}</span>
                      {(activeChat.username === currentUser.username) && (
                        <span className="text-indigo-500 font-bold ml-1">(You)</span>
                      )}
                    </h3>
                    {otherUserTyping && !activeChat.group ? (
                      <span className="text-[10px] text-cyan-500 font-bold flex items-center space-x-1 mt-0.5 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full inline-block"></span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500">typing...</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1 mt-0.5">
                        {activeChat.group ? (
                          <span>
                            {(() => {
                              const totalCount = groupInfoDetails?.members?.length || activeChat.memberCount || 1;
                              if (groupInfoDetails?.members && groupInfoDetails.members.length > 0) {
                                const names = groupInfoDetails.members.map(m => m.fullName.split(' ')[0]);
                                const displayLimit = 3;
                                const displayedNames = names.slice(0, displayLimit).join(', ');
                                const remaining = names.length - displayLimit;
                                return `${totalCount} members • ${displayedNames}${remaining > 0 ? ` +${remaining}` : ''}`;
                              }
                              return `${totalCount} members`;
                            })()}
                          </span>
                        ) : (
                          <>
                            {activeChat.online && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>}
                            <span>{activeChat.lastSeen || (activeChat.online ? 'Online' : 'Offline')}</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="flex items-center space-x-1">
                  {!activeChat.group && (
                    <>
                      <motion.button 
                        onClick={() => {
                          startCall({
                            id: activeChat.otherUserId,
                            name: activeChat.name,
                            avatarUrl: (activeChat.avatar && (activeChat.avatar.startsWith('data:') || activeChat.avatar.startsWith('http'))) ? activeChat.avatar : null,
                            phoneNumber: ''
                          });
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100/40 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                      </motion.button>
                      <motion.button 
                        onClick={() => {
                          startCall({
                            id: activeChat.otherUserId,
                            name: activeChat.name,
                            avatarUrl: (activeChat.avatar && (activeChat.avatar.startsWith('data:') || activeChat.avatar.startsWith('http'))) ? activeChat.avatar : null,
                            phoneNumber: ''
                          });
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100/40 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}
                  <motion.button 
                    onClick={() => {
                      if (activeChat.group) {
                        const gId = activeChat.groupId || activeChat.id.replace('group_', '');
                        fetchGroupInfo(gId);
                        setShowGroupInfoPanel(true);
                      }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100/40 text-slate-500 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </motion.button>
                </div>

              </div>



              {/* Messages List Area (Custom Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/20 backdrop-blur-[2px]">
                
                <AnimatePresence mode="wait">
                  {loadingMessages ? (
                    // Premium pulsing skeleton message cards to remove blank feel
                    <motion.div 
                      key="loading-skeletons"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4 animate-pulse select-none pointer-events-none w-full"
                    >
                      <div className="flex flex-col items-start max-w-[60%] mr-auto">
                        <div className="h-9 w-40 bg-slate-300/25 rounded-2xl rounded-bl-sm" />
                      </div>
                      <div className="flex flex-col items-end max-w-[60%] ml-auto">
                        <div className="h-9 w-32 bg-slate-400/20 rounded-2xl rounded-br-sm" />
                      </div>
                      <div className="flex flex-col items-start max-w-[60%] mr-auto">
                        <div className="h-9 w-48 bg-slate-300/25 rounded-2xl rounded-bl-sm" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="chat-messages-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 w-full"
                    >
                      {activeChat.messages.map((msg, idx) => {
                        const prevMsg = idx > 0 ? activeChat.messages[idx - 1] : null;
                        const isConsecutive = prevMsg && String(prevMsg.senderId) === String(msg.senderId);
                        return (
                          <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isYou={msg.sender === 'you'}
                            isConsecutive={!!isConsecutive}
                            group={activeChat.group}
                            activeChat={activeChat}
                            onPreviewImage={setPreviewImage}
                          />
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Realtime dynamic typing indicator from active user */}
                  {(isTyping || otherUserTyping) && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center space-x-2 bg-white/80 backdrop-blur-[5px] border border-slate-200/40 py-2.5 px-4 rounded-2xl shadow-sm mr-auto max-w-[80%]"
                    >
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none mr-1.5">{activeChat.name} is typing</span>
                      <div className="flex items-center space-x-0.5">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Typing Message Box Bar */}
              <div className="p-4 bg-transparent border-t border-slate-200/50 z-10 flex flex-col space-y-2 relative">
                
                {/* Premium Glassmorphic Emoji Picker Popover */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <>
                      {/* Click-away backdrop */}
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowEmojiPicker(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-16 left-4 w-[280px] h-[320px] bg-white/95 backdrop-blur-[20px] border border-white/80 rounded-3xl shadow-2xl p-3.5 z-50 flex flex-col"
                      >
                        {/* Title Bar / Categories Tab Header */}
                        <div className="flex items-center space-x-1.5 border-b border-slate-100/80 pb-2 overflow-x-auto shrink-0 select-none custom-scrollbar-horizontal">
                          {emojiCategories.map(cat => (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => setActiveEmojiTab(cat.name)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                activeEmojiTab === cat.name
                                  ? 'bg-gradient-to-tr from-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-200/30'
                                  : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>

                        {/* Scrolling Emojis List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar mt-2.5 pr-0.5">
                          <div className="grid grid-cols-6 gap-1.5">
                            {emojiCategories.find(c => c.name === activeEmojiTab)?.emojis.map((emoji, idx) => (
                              <motion.button
                                key={`${emoji}-${idx}`}
                                type="button"
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setInputMessage(prev => prev + emoji);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-[19px] rounded-xl hover:bg-indigo-50/80 transition-all cursor-pointer"
                              >
                                {emoji}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
                
                {/* Invisible native file input for Paperclip */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />

                {/* Animated File Attachment Preview Card */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="p-3 bg-white/75 backdrop-blur-[15px] border border-slate-200/50 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden select-none max-w-[340px]"
                    >
                      <div className="flex items-center space-x-3">
                        {selectedFile.type.startsWith('image/') ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                            <img src={selectedFile.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                            <FileText className="w-5.5 h-5.5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold text-slate-800 truncate pr-2 leading-snug">{selectedFile.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{selectedFile.sizeString}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setInputMessage('');
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSendMessage} className="w-full flex items-center space-x-2.5">
                  
                  {isRecording ? (
                    /* Active Voice Note Recording Interface */
                    <div className="flex-1 flex items-center justify-between rounded-2xl bg-indigo-50/80 backdrop-blur-[10px] px-3.5 py-1.5 border border-indigo-100/50 relative overflow-hidden animate-pulse">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping shrink-0" />
                        <span className="text-[12px] text-rose-500 font-bold font-mono tracking-wide select-none">
                          Recording [{formatDuration(recordingDuration)}]
                        </span>
                      </div>

                      {/* Glowing wave ripple visualizer bar */}
                      <div className="flex items-center space-x-1 pr-6 opacity-70">
                        <div className="w-0.5 h-3.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 h-5.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        <div className="w-0.5 h-4.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-0.5 h-6.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        <div className="w-0.5 h-3.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      </div>

                      {/* Delete Recording Button */}
                      <button
                        type="button"
                        onClick={() => stopRecordingAndSend(false)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-100/50 text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ) : (
                    /* Standard Message Input Bar */
                    <div className="flex-1 flex items-center space-x-1 rounded-2xl glass-input-bar px-3 py-1.5 border border-white/60">
                      
                      {/* Emoji panel toggle button */}
                      <motion.button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        whileTap={{ scale: 0.95 }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          showEmojiPicker 
                            ? 'text-indigo-600 bg-indigo-50/50' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                        }`}
                      >
                        <Smile className="w-5 h-5" />
                      </motion.button>

                      {/* Main typing input field */}
                      <input 
                        type="text"
                        value={inputMessage}
                        onChange={handleInputChange}
                        disabled={!!selectedFile}
                        placeholder={selectedFile ? "Ready to upload file..." : `Type a message to ${activeChat.name}...`}
                        className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-slate-800 placeholder-slate-400 font-medium py-1 px-1.5 disabled:opacity-70"
                      />

                      {/* Attachment file selector toggle (Paperclip) */}
                      <motion.button 
                        type="button"
                        onClick={handlePaperclipClick}
                        whileTap={{ scale: 0.95 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-4.5 h-4.5" />
                      </motion.button>

                    </div>
                  )}

                  {/* Dynamic Action Trigger Button */}
                  {isRecording ? (
                    /* Send Voice Note Trigger */
                    <motion.button
                      key="send-voice-btn"
                      type="button"
                      onClick={() => stopRecordingAndSend(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-300/30 cursor-pointer"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </motion.button>
                  ) : (inputMessage.trim() || selectedFile) ? (
                    /* Send standard text or photo attachment */
                    <motion.button
                      key="send-btn"
                      type="submit"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-300/20 cursor-pointer"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </motion.button>
                  ) : (
                    /* Microphone Recording Trigger */
                    <motion.button
                      key="voice-btn"
                      type="button"
                      onClick={startRecording}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl bg-white/60 hover:bg-indigo-50 border border-slate-200/50 flex items-center justify-center text-slate-400 hover:text-indigo-500 shadow-sm cursor-pointer transition-colors"
                    >
                      <Mic className="w-4.5 h-4.5 animate-pulse" />
                    </motion.button>
                  )}

                </form>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative select-none">
              {/* ambient backglow inside welcome panel */}
              <div className="absolute w-[300px] h-[300px] rounded-full bg-violet-400/10 blur-[80px] pointer-events-none" />
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center space-y-5 max-w-sm z-10"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-300/40 relative">
                  <MessageSquare className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 rounded-3xl bg-violet-400/20 blur-md -z-10" />
                </div>
                
                <div>
                  <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">Welcome to Bloop</h2>
                  <p className="text-[12.5px] text-slate-500 mt-2 leading-relaxed">
                    Select an active conversation from the chat list sidebar, or click the compose button at the top to search and connect with other users!
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComposeModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-[12px] font-bold shadow-md shadow-indigo-300/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Conversation</span>
                </motion.button>
              </motion.div>
            </div>
          )}

        </div>

      </motion.div>

      {/* ================= ULTRA-PREMIUM GLASS COMPOSE MODAL ================= */}
      <AnimatePresence>
        {showComposeModal && (
          <div className="fixed inset-0 w-full h-dvh flex items-center justify-center z-[100] p-4">
            {/* Dark glass blur backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComposeModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[8px]"
            />
            
            {/* Modal Body Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-md bg-white/75 backdrop-blur-[20px] border border-white/80 rounded-3xl shadow-2xl p-6 z-10 flex flex-col max-h-[80vh] relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowComposeModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all cursor-pointer"
              >
                <span className="text-[18px] font-bold">×</span>
              </button>

              <h3 className="text-[16px] font-extrabold text-slate-800 tracking-tight flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <span>Start a New Chat</span>
              </h3>

              {/* Live search input for registered users */}
              <div className="relative flex items-center mb-4">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search registered users by name..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full bg-white/40 border border-slate-200/50 hover:bg-white/60 focus:bg-white/80 focus:border-indigo-400/50 outline-none text-[13px] py-2.5 pl-10 pr-4 rounded-xl placeholder-slate-400 transition-all duration-300"
                />
              </div>

              {/* Scrollable list of registered users */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar min-h-[250px]">
                {loadingUsers ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[11.5px] text-slate-400 font-semibold">Loading users...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-medium text-[12px] select-none">
                    No other registered users found.
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <motion.div
                      key={user.id}
                      onClick={() => startNewChat(user)}
                      whileHover={{ x: 2, backgroundColor: "rgba(255,255,255,0.7)" }}
                      className="p-3 bg-white/30 border border-white/40 rounded-2xl flex items-center space-x-3 cursor-pointer transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-[13.5px] shadow-sm overflow-hidden select-none shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          user.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12.5px] font-bold text-slate-800 truncate">
                          {user.fullName}
                          {(user.id === currentUser.id || user.username === currentUser.username) && (
                            <span className="text-indigo-500 font-bold ml-1">(You)</span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  ))
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ================= FULL-SCREEN IMAGE PREVIEW OVERLAY ================= */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 w-full h-dvh flex items-center justify-center z-[200] p-4">
            {/* Ultra-dark blur backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-[12px] cursor-zoom-out"
            />

            {/* Glowing neon back-accent */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

            {/* Image Preview Container Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-w-[90vw] max-h-[85vh] z-10 flex flex-col items-center select-none"
            >
              {/* Close Button at top-right */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPreviewImage(null)}
                className="absolute top-[-50px] right-0 md:right-[-10px] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Large Image itself */}
              <img 
                src={previewImage} 
                alt="Full Preview" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl border border-white/10 shadow-2xl" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CREATE GROUP MODAL ================= */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 w-full h-dvh flex items-center justify-center z-[110] p-4">
            {/* Dark glass backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isCreatingGroup) setShowCreateGroupModal(false);
              }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-[8px]"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-md bg-white/80 backdrop-blur-[25px] border border-white/85 rounded-[28px] shadow-2xl p-6 z-10 flex flex-col max-h-[85vh] relative"
            >
              {/* Close button */}
              <button 
                disabled={isCreatingGroup}
                onClick={() => setShowCreateGroupModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] text-violet-600 font-extrabold uppercase tracking-wider bg-violet-100/60 px-2.5 py-1 rounded-full">
                  Step {activeGroupStep} of 2
                </span>
                <h3 className="text-[17px] font-extrabold text-slate-800 tracking-tight mt-2 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-violet-500" />
                  <span>Create New Group</span>
                </h3>
                <p className="text-[11.5px] text-slate-400 mt-1">Bring people together in one conversation.</p>
              </div>

              {/* STEP 1: GROUP DETAILS */}
              {activeGroupStep === 1 && (
                <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-1 custom-scrollbar">
                  
                  {/* Group Avatar Upload */}
                  <div className="flex flex-col items-center space-y-2 py-2">
                    <div className="relative group/avatar cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleGroupAvatarUpload} 
                        className="hidden" 
                        id="group-avatar-input" 
                      />
                      <label htmlFor="group-avatar-input" className="cursor-pointer block">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[24px] font-extrabold shadow-md relative overflow-hidden border-2 border-white">
                          {groupAvatar ? (
                            <img src={groupAvatar} alt="Group Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-7 h-7 text-white/90" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">Group Avatar (Optional)</span>
                  </div>

                  {/* Group Name */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-600">Group Name *</label>
                      <span className={`text-[9px] font-bold ${groupName.length > 50 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {groupName.length}/50
                      </span>
                    </div>
                    <input 
                      type="text" 
                      maxLength={50}
                      placeholder="e.g. Design Team, Family Reunion" 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full bg-white/50 border border-slate-200/50 focus:bg-white focus:border-violet-500 outline-none text-[12.5px] px-3.5 py-2.5 rounded-xl font-medium transition-all"
                    />
                  </div>

                  {/* Group Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Description (Optional)</label>
                    <textarea 
                      rows={2}
                      placeholder="What is this group about?" 
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="w-full bg-white/50 border border-slate-200/50 focus:bg-white focus:border-violet-500 outline-none text-[12.5px] px-3.5 py-2 rounded-xl font-medium transition-all resize-none"
                    />
                  </div>

                  {/* Group Privacy Options */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">Privacy & Visibility</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div 
                        onClick={() => setGroupPrivacy('public')}
                        className={`p-3 border rounded-xl flex items-center space-x-2 cursor-pointer transition-all ${
                          groupPrivacy === 'public' 
                            ? 'bg-violet-500/10 border-violet-500/50 text-violet-700 font-bold' 
                            : 'bg-white/40 border-slate-200/50 text-slate-600'
                        }`}
                      >
                        <Globe className="w-4 h-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11.5px] leading-tight">Public</p>
                          <p className="text-[8.5px] text-slate-400 font-normal truncate mt-0.5">Anyone can find and join</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setGroupPrivacy('private')}
                        className={`p-3 border rounded-xl flex items-center space-x-2 cursor-pointer transition-all ${
                          groupPrivacy === 'private' 
                            ? 'bg-violet-500/10 border-violet-500/50 text-violet-700 font-bold' 
                            : 'bg-white/40 border-slate-200/50 text-slate-600'
                        }`}
                      >
                        <Lock className="w-4 h-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11.5px] leading-tight">Private</p>
                          <p className="text-[8.5px] text-slate-400 font-normal truncate mt-0.5">Invite only access</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 2: SELECT MEMBERS */}
              {activeGroupStep === 2 && (
                <div className="flex flex-col flex-1 overflow-hidden min-h-[350px]">
                  
                  {/* Selected members horizontal scroll chips */}
                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto py-1.5 px-0.5 border-b border-slate-100">
                      {selectedMembers.map(user => (
                        <div 
                          key={user.id} 
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-[10.5px] font-bold"
                        >
                          <span>{user.fullName}</span>
                          <button 
                            onClick={() => setSelectedMembers(prev => prev.filter(m => m.id !== user.id))}
                            className="w-3.5 h-3.5 rounded-full hover:bg-violet-200 flex items-center justify-center cursor-pointer text-violet-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Live Search members query */}
                  <div className="relative flex items-center my-3 shrink-0">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                      type="text" 
                      placeholder="Search people to add..."
                      value={groupMemberSearchQuery}
                      onChange={(e) => setGroupMemberSearchQuery(e.target.value)}
                      className="w-full bg-white/40 border border-slate-200/50 hover:bg-white/60 focus:bg-white focus:border-violet-400/50 outline-none text-[12px] py-2 pl-9 pr-4 rounded-xl placeholder-slate-400 transition-all duration-200"
                    />
                  </div>

                  {/* Searchable member catalog list */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                    {loadingUsers ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-2">
                        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[11px] text-slate-400 font-semibold">Loading members...</span>
                      </div>
                    ) : filteredRegisteredUsers.filter(u => 
                      u.fullName.toLowerCase().includes(groupMemberSearchQuery.toLowerCase()) ||
                      u.username.toLowerCase().includes(groupMemberSearchQuery.toLowerCase())
                    ).length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-medium text-[11px]">
                        No matches found.
                      </div>
                    ) : (
                      filteredRegisteredUsers.filter(u => 
                        u.fullName.toLowerCase().includes(groupMemberSearchQuery.toLowerCase()) ||
                        u.username.toLowerCase().includes(groupMemberSearchQuery.toLowerCase())
                      ).map(user => {
                        const isSelected = selectedMembers.some(m => m.id === user.id);
                        return (
                          <div 
                            key={user.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedMembers(prev => prev.filter(m => m.id !== user.id));
                              } else {
                                setSelectedMembers(prev => [...prev, user]);
                              }
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-violet-50/50 border-violet-200' 
                                : 'bg-white/20 border-white/40 hover:bg-white/40'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-violet-400 to-indigo-500 text-white flex items-center justify-center font-extrabold text-[12px] relative overflow-hidden shrink-0">
                                {user.avatar ? (
                                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  getInitials(user.fullName)
                                )}
                                {user.online && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full z-10"></span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-bold text-slate-700 truncate">{user.fullName}</p>
                                <p className="text-[9.5px] text-slate-400 truncate">@{user.username || 'user'}</p>
                              </div>
                            </div>

                            {/* Checkbox circle indicator */}
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-violet-600 border-violet-600 text-white' 
                                : 'border-slate-300 bg-white/60'
                            }`}>
                              {isSelected && <span className="text-[10px] font-bold">✓</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

              {/* Action buttons footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4 shrink-0">
                {activeGroupStep === 2 ? (
                  <button 
                    disabled={isCreatingGroup}
                    onClick={() => setActiveGroupStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-[11px] font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {activeGroupStep === 1 ? (
                  <button 
                    onClick={() => {
                      if (groupName.trim()) setActiveGroupStep(2);
                    }}
                    disabled={!groupName.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-[12px] font-bold shadow-md shadow-indigo-300/30 cursor-pointer disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    onClick={handleCreateGroup}
                    disabled={selectedMembers.length === 0 || isCreatingGroup}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-[12px] font-bold shadow-md shadow-indigo-300/30 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
                  >
                    {isCreatingGroup ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Group ({selectedMembers.length + 1})</span>
                    )}
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= GROUP INFO PANEL (SLIDE-OVER PANEL) ================= */}
      <AnimatePresence>
        {showGroupInfoPanel && groupInfoDetails && (
          <div className="fixed inset-0 w-full h-dvh z-[120] flex justify-end overflow-hidden">
            {/* Dark glass backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGroupInfoPanel(false)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-[4px]"
            />

            {/* Panel Roster */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-sm h-full bg-white/90 backdrop-blur-[20px] border-l border-slate-200/50 shadow-2xl p-6 z-10 flex flex-col relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowGroupInfoPanel(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Group Metadata Summary */}
              <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100 select-none">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-[24px] shadow-md border-2 border-white relative overflow-hidden mb-3">
                  {groupInfoDetails.avatar ? (
                    <img src={groupInfoDetails.avatar} alt="Group Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[28px]">👥</span>
                  )}
                </div>

                <h3 className="text-[16px] font-extrabold text-slate-800 tracking-tight leading-tight flex items-center justify-center space-x-1.5">
                  <span>{groupInfoDetails.name}</span>
                  {groupInfoDetails.isPrivate ? (
                    <Lock className="w-3.5 h-3.5 text-rose-500" title="Private Group" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-emerald-500" title="Public Group" />
                  )}
                </h3>
                
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Created {new Date(groupInfoDetails.createdAt).toLocaleDateString()}
                </p>

                {groupInfoDetails.description && (
                  <p className="text-[12px] text-slate-500 font-medium mt-3 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50 max-w-full text-left leading-relaxed">
                    {groupInfoDetails.description}
                  </p>
                )}
              </div>

              {/* Participant Directory Header */}
              <div className="my-3 flex items-center justify-between select-none">
                <span className="text-[11.5px] font-extrabold text-slate-700 tracking-tight">
                  Participants ({groupInfoDetails.members?.length || 0})
                </span>
              </div>

              {/* Participant List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {groupInfoDetails.members?.map(member => (
                  <div 
                    key={member.id}
                    className="p-2 bg-white/40 border border-white/50 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-500 text-white flex items-center justify-center font-extrabold text-[11px] relative overflow-hidden shrink-0">
                        {member.avatar ? (
                          <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(member.fullName)
                        )}
                        {member.isOnline === 1 && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full z-10"></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-bold text-slate-700 truncate leading-tight flex items-center">
                          <span>{member.fullName}</span>
                          {member.id === currentUser.id && (
                            <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-50 text-indigo-500 font-bold ml-1">You</span>
                          )}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">@{member.username || 'user'}</p>
                      </div>
                    </div>

                    {/* Member Role Tag badge */}
                    <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      member.role === 'admin' 
                        ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Danger Actions Area */}
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2 select-none">
                {groupInfoDetails.createdBy === currentUser.id ? (
                  <button 
                    onClick={() => {
                      if (confirm("⚠️ Are you absolutely sure you want to delete this group? All message history will be permanently destroyed.")) {
                        handleDeleteGroup(groupInfoDetails.groupId);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-[12px] font-bold shadow-md shadow-red-300/30 flex items-center justify-center space-x-1.5 cursor-pointer hover:from-rose-600 hover:to-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Group</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (confirm("👥 Leave this group conversation?")) {
                        handleLeaveGroup(groupInfoDetails.groupId);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-600 text-[12px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Leave Group</span>
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
