import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar, 
  Camera, 
  Shield, 
  Bell, 
  Palette, 
  Laptop, 
  LogOut, 
  MessageSquare, 
  Layers, 
  Image as ImageIcon, 
  Users, 
  Sparkles, 
  Check, 
  Loader2,
  Trash2,
  Heart,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import './ProfilePage.css'; // Optimized custom styles

export default function ProfilePage() {
  const navigate = useNavigate();
  
  // Local states
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Form fields state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    statusMessage: '',
    avatarColor: 'from-sky-400 to-indigo-500'
  });

  const [originalData, setOriginalData] = useState(null);

  const hasChanges = () => {
    if (!originalData) return false;
    
    // Check form fields
    const fieldsChanged = Object.keys(formData).some(key => {
      return (formData[key] || '') !== (originalData[key] || '');
    });
    
    // Check avatar
    const avatarChanged = avatarPreview !== originalData.avatar;
    
    return fieldsChanged || avatarChanged;
  };

  // Photo upload states (simulated / preset selectable)
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Real-time Username & Phone availability check states
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameMessage, setUsernameMessage] = useState('');
  const [shakeUsername, setShakeUsername] = useState(false);

  const [phoneStatus, setPhoneStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  const [phoneMessage, setPhoneMessage] = useState('');
  const [shakePhone, setShakePhone] = useState(false);

  // OTP Verification Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value && isNaN(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    setOtpError('');

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const newValues = [...otpValues];
        newValues[index - 1] = '';
        setOtpValues(newValues);
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      } else {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && !isNaN(pastedData)) {
      const chars = pastedData.split('');
      setOtpValues(chars);
      setOtpError('');
      const lastInput = document.getElementById('otp-input-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setOtpLoading(true);
    setOtpError('');
    const apiUrl = import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com';
    
    axios.post(`${apiUrl}/api/auth/send-email-otp`, {
      userId: currentUser.id,
      newEmail: formData.email.trim().toLowerCase()
    })
    .then(res => {
      setOtpLoading(false);
      if (res.data && res.data.success) {
        setResendTimer(30);
        setOtpValues(['', '', '', '', '', '']);
        triggerToast("📬 A fresh verification code has been dispatched!");
      }
    })
    .catch(err => {
      setOtpLoading(false);
      const errMsg = err.response?.data?.message || "Failed to resend code.";
      setOtpError(errMsg);
    });
  };

  const handleVerifyOtp = () => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    const apiUrl = import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com';

    axios.post(`${apiUrl}/api/auth/verify-email-otp`, {
      userId: currentUser.id,
      otp: fullOtp
    })
    .then(res => {
      setOtpLoading(false);
      if (res.data && res.data.success) {
        setOtpSuccess(true);
        triggerToast("✓ Email verified and updated successfully!");
        
        const updatedUser = {
          ...currentUser,
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email.trim().toLowerCase(),
          avatar: avatarPreview,
          avatarColor: formData.avatarColor
        };
        localStorage.setItem('bloop_user', JSON.stringify(updatedUser));
        
        setOriginalData({
          ...formData,
          email: formData.email.trim().toLowerCase(),
          avatar: avatarPreview
        });

        setTimeout(() => {
          setShowOtpModal(false);
          setOtpSuccess(false);
        }, 1500);
      }
    })
    .catch(err => {
      setOtpLoading(false);
      const errMsg = err.response?.data?.message || "Invalid verification code";
      setOtpError(errMsg);
    });
  };

  // Debounced real-time username availability validation
  useEffect(() => {
    const username = formData.username;
    if (!username || !currentUser) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (isInitialLoad) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    const normalized = username.toLowerCase().trim();
    
    // Quick frontend regex format check:
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(normalized)) {
      setUsernameStatus('invalid');
      if (normalized.length < 3) {
        setUsernameMessage('Username must be at least 3 characters');
      } else if (normalized.length > 20) {
        setUsernameMessage('Username cannot exceed 20 characters');
      } else if (/[A-Z]/.test(username)) {
        setUsernameMessage('Only lowercase letters are allowed');
      } else {
        setUsernameMessage('Only letters, numbers, and underscores are allowed');
      }
      return;
    }

    // Set checking state
    setUsernameStatus('checking');
    setUsernameMessage('Checking username...');

    // Debounce: Wait 500ms after user stops typing to call API
    const delayTimer = setTimeout(() => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com';
      axios.get(`${apiUrl}/api/auth/check-username/${normalized}?excludeUserId=${currentUser.id}`)
        .then(res => {
          if (res.data.available) {
            setUsernameStatus('available');
            setUsernameMessage('Username available');
          } else {
            setUsernameStatus('taken');
            setUsernameMessage(res.data.message || 'This username is already taken');
          }
        })
        .catch(err => {
          console.error("❌ Failed checking username availability:", err);
          setUsernameStatus('idle');
          setUsernameMessage('');
        });
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [formData.username, currentUser, isInitialLoad]);

  // Debounced real-time phone number availability validation
  useEffect(() => {
    const phone = formData.phone;
    if (!phone || !currentUser) {
      setPhoneStatus('idle');
      setPhoneMessage('');
      return;
    }

    if (isInitialLoad) {
      setPhoneStatus('idle');
      setPhoneMessage('');
      return;
    }

    const cleaned = phone.trim();
    
    // Phone length check
    if (cleaned.length < 5) {
      setPhoneStatus('invalid');
      setPhoneMessage('Please enter a valid phone number.');
      return;
    }

    // Set checking state
    setPhoneStatus('checking');
    setPhoneMessage('Checking phone number...');

    // Debounce: Wait 500ms after user stops typing to call API
    const delayTimer = setTimeout(() => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com';
      axios.get(`${apiUrl}/api/auth/check-phone/${encodeURIComponent(cleaned)}?excludeUserId=${currentUser.id}`)
        .then(res => {
          if (res.data.available) {
            setPhoneStatus('available');
            setPhoneMessage('Phone number available');
          } else {
            setPhoneStatus('taken');
            setPhoneMessage(res.data.message || 'This phone number is already connected to another account.');
          }
        })
        .catch(err => {
          console.error("❌ Failed checking phone availability:", err);
          setPhoneStatus('idle');
          setPhoneMessage('');
        });
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [formData.phone, currentUser, isInitialLoad]);



  useEffect(() => {
    // Get logged-in user from localStorage
    const rawUser = localStorage.getItem('bloop_user');
    if (!rawUser) {
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(rawUser);
      setCurrentUser(parsed);
      fetchUserProfile(parsed.id);
    } catch (e) {
      console.error("❌ Failed to parse logged in user:", e);
      navigate('/login');
    }
  }, [navigate]);

  // Intentional scroll to top exactly once when loading completes and main content mounts
  useEffect(() => {
    if (!loading) {
      const container = document.querySelector('.profile-page-wrapper');
      if (container) {
        container.scrollTop = 0;
      }
    }
  }, [loading]);

  const fetchUserProfile = (userId) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com';
    axios.get(`${apiUrl}/api/auth/profile/${userId}`)
      .then(res => {
        if (res.data && res.data.profile) {
          const profile = res.data.profile;
          const initialForm = {
            fullName: profile.fullName || '',
            username: profile.username || '',
            email: profile.email || '',
            bio: profile.bio || '',
            phone: profile.phone || '',
            location: profile.location || '',
            website: profile.website || '',
            statusMessage: profile.statusMessage || '',
            avatarColor: profile.avatarColor || 'from-sky-400 to-indigo-500'
          };
          setFormData(initialForm);
          setAvatarPreview(profile.avatar);
          setOriginalData({
            ...initialForm,
            avatar: profile.avatar || null
          });
          
          setIsInitialLoad(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Failed to fetch user profile:", err);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'username' || name === 'phone') {
      setIsInitialLoad(false);
    }
  };

  // Simulating image upload with beautiful canvas-free drag & drop preview
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAvatarPreview(uploadEvent.target.result);
        triggerToast("Profile picture loaded! Click Save to apply changes.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAvatarPreview(uploadEvent.target.result);
        triggerToast("Profile picture loaded! Click Save to apply changes.");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      setShakeUsername(true);
      setTimeout(() => setShakeUsername(false), 500);
      triggerToast("❌ Please fix username validation errors before saving.");
      return;
    }

    if (phoneStatus === 'taken' || phoneStatus === 'invalid') {
      setShakePhone(true);
      setTimeout(() => setShakePhone(false), 500);
      triggerToast("❌ Please fix phone number validation errors before saving.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      triggerToast("❌ Please provide a valid email format.");
      return;
    }

    setSaving(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com';
    
    // Package update payload (Forces saving current database email in the main PUT request first)
    const payload = {
      ...formData,
      email: originalData.email,
      avatar: avatarPreview
    };

    axios.put(`${apiUrl}/api/auth/profile/${currentUser.id}`, payload)
      .then(res => {
        if (res.data && res.data.success) {
          // If the email address has been modified
          if (formData.email.trim().toLowerCase() !== originalData.email.trim().toLowerCase()) {
            axios.post(`${apiUrl}/api/auth/send-email-otp`, {
              userId: currentUser.id,
              newEmail: formData.email.trim().toLowerCase()
            })
            .then(otpRes => {
              setSaving(false);
              if (otpRes.data && otpRes.data.success) {
                // Launch verification overlay modal
                setOtpValues(['', '', '', '', '', '']);
                setOtpError('');
                setOtpSuccess(false);
                setShowOtpModal(true);
                setResendTimer(30);
                triggerToast("📬 Code sent to your new email address!");
              }
            })
            .catch(otpErr => {
              setSaving(false);
              console.error("❌ Failed to dispatch email OTP verification:", otpErr);
              const errMsg = otpErr.response?.data?.message || "Failed to dispatch verification code.";
              triggerToast(`❌ ${errMsg}`);
            });
          } else {
            // No email change: standard successful save
            setSaving(false);
            triggerToast("✨ Profile updated successfully!");
            
            // Sync changes back to localStorage
            const updatedUser = {
              ...currentUser,
              fullName: formData.fullName,
              username: formData.username,
              email: formData.email,
              avatar: avatarPreview,
              avatarColor: formData.avatarColor
            };
            localStorage.setItem('bloop_user', JSON.stringify(updatedUser));
            
            setOriginalData({
              ...formData,
              avatar: avatarPreview
            });
          }
        }
      })
      .catch(err => {
        setSaving(false);
        console.error("❌ Failed to save changes:", err);
        const errMsg = err.response?.data?.message || "Failed to update profile settings.";
        triggerToast(`❌ ${errMsg}`);
      });
  };

  const handleLogout = () => {
    if (!currentUser) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com';
    
    axios.post(`${apiUrl}/api/auth/logout`, { userId: currentUser.id })
      .then(() => {
        localStorage.removeItem('bloop_user');
        navigate('/login');
      })
      .catch(err => {
        console.error("❌ Logout error:", err);
        localStorage.removeItem('bloop_user');
        navigate('/login');
      });
  };

  if (loading) {
    return (
      <div className="profile-loading-screen">
        <div className="profile-loading-glow-1" />
        <div className="profile-loading-glow-2" />
        <div className="flex flex-col items-center justify-center relative z-10 space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <span className="text-[12.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Loading Workspace...
          </span>
        </div>
      </div>
    );
  }

  // Pre-sets of elegant avatar color gradients
  const gradients = [
    { name: 'Sky Indigo', value: 'from-sky-400 to-indigo-500' },
    { name: 'Sunset Orange', value: 'from-amber-400 to-rose-500' },
    { name: 'Cosmic Pink', value: 'from-fuchsia-500 via-pink-500 to-rose-400' },
    { name: 'Aurora Green', value: 'from-emerald-400 to-cyan-500' },
    { name: 'Royal Violet', value: 'from-violet-600 to-indigo-600' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="profile-page-wrapper custom-scrollbar"
    >
      {/* Premium Gradient mesh Background */}
      <div className="profile-mesh-glow-1" />
      <div className="profile-mesh-glow-2" />
      <div className="profile-mesh-glow-3" />

      {/* Premium Sticky Frosted Top Header - More Compact */}
      <header className="profile-header-bar">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-full">
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat')}
              className="w-9 h-9 rounded-xl bg-white/70 hover:bg-white border border-slate-200/50 flex items-center justify-center text-slate-600 transition-colors shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </motion.button>
            
            <div className="flex items-center space-x-1.5">
              <span className="text-[13px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 uppercase font-mono">
                Bloop
              </span>
              <span className="text-[13px] font-medium text-slate-300">|</span>
              <h1 className="text-[13.5px] font-extrabold text-slate-800 tracking-tight">My Profile</h1>
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50/70 border border-indigo-100 px-2.5 py-0.5 rounded-full flex items-center space-x-1 select-none">
              <Sparkles className="w-3 h-3" />
              <span>Pro Plan Active</span>
            </span>
          </div>

        </div>
      </header>

      {/* Main Page Centered Layout - Aligned Top Edges & Reduced Top Spacing */}
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Settings Sidebar (Frosted Glass Card) - Slightly narrower, aligned perfectly */}
        <section className="lg:col-span-3 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="profile-sidebar-card"
          >
            <div className="p-3 border-b border-slate-100/50">
              <h3 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest pl-1">Settings</h3>
            </div>
            
            <nav className="p-1.5 space-y-0.5">
              {[
                { id: 'profile', label: 'Edit Profile', icon: User },
                { id: 'privacy', label: 'Privacy & Chats', icon: Shield },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'appearance', label: 'Appearance', icon: Palette },
                { id: 'devices', label: 'Connected Devices', icon: Laptop },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id !== 'profile') {
                        triggerToast(`"${item.label}" panel is simulated in Bloop Pro! Edit fields in Edit Profile.`);
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl text-[12px] font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-indigo-600 border-l-4 border-indigo-500 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-slate-100/50 my-2 pt-2" />

              <button
                onClick={handleLogout}
                className="w-full p-2.5 rounded-xl text-[12px] font-bold flex items-center space-x-2.5 text-rose-500 hover:bg-rose-50/50 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Session</span>
              </button>
            </nav>
          </motion.div>

          {/* Connected Secure MySQL Node DB Status */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="profile-sidebar-card p-4 text-[10.5px] text-slate-400 font-semibold space-y-2 select-none border-dashed border-indigo-100"
          >
            <div className="flex items-center space-x-1.5 text-indigo-500">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-extrabold uppercase">Bloop Database Shield</span>
            </div>
            <p className="leading-relaxed">Your profile changes are synchronized immediately across all active chat sessions and persisted to your local SQL schemas.</p>
          </motion.div>
        </section>

        {/* Right Side Main Profile Content Card - Aligned top edge with left sidebar */}
        <section className="lg:col-span-9">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card overflow-hidden p-6 md:p-8 space-y-8"
          >
            <form onSubmit={handleSaveChanges} className="space-y-8">
              
              {/* -------------------- 1. REDESIGNED HERO SECTION (Horizontally Aligned) -------------------- */}
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-slate-100/50">
                
                {/* LEFT: Large avatar with dynamic gradient ring & active online status indicator */}
                <div className="relative flex-shrink-0 group select-none">
                  <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-violet-500 via-pink-400 to-cyan-400 shadow-lg hover:scale-102 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden relative">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className={`w-full h-full rounded-full bg-gradient-to-tr ${formData.avatarColor} text-white flex items-center justify-center font-black text-3xl uppercase`}>
                          {formData.fullName.charAt(0) || '?'}
                        </div>
                      )}
                      
                      {/* Camera Overlay */}
                      <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-5 h-5 mb-0.5" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">Change</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                  
                  {/* Green active status indicator */}
                  <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>

                {/* RIGHT: User details text grid & inline horizontal buttons */}
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center space-y-1.5 md:space-y-0 md:space-x-3 justify-center md:justify-start">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">
                      {formData.fullName || 'User Name'}
                    </h2>
                    <span className="text-[10px] font-extrabold bg-slate-100/80 text-slate-500 border border-slate-200/40 px-2.5 py-0.5 rounded-full select-none font-mono">
                      @{formData.username || 'username'}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1 text-[11px] font-semibold text-slate-400 tracking-tight">
                    <div className="flex items-center justify-center md:justify-start space-x-1.5 font-mono">
                      <Mail className="w-3.5 h-3.5 text-slate-300" />
                      <span>{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex items-center justify-center md:justify-start space-x-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                        <span>{formData.phone}</span>
                      </div>
                    )}
                  </div>



                  {/* REDESIGNED ACTIONS BUTTONS ROW (Vertically & Horizontally aligned) */}
                  <div className="flex items-center justify-center md:justify-start space-x-2 pt-2">
                    <label className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-50 px-3.5 py-1.5 rounded-full cursor-pointer transition-all flex items-center space-x-1 select-none">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Avatar</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setAvatarPreview(null);
                        triggerToast("Avatar reset! Save changes to apply initials style.");
                      }}
                      className="text-[10px] font-extrabold text-slate-500 hover:text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full cursor-pointer transition-all flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  </div>

                </div>

              </div>



              {/* -------------------- 3. FORM INFORMATION FIELDS -------------------- */}
              <div className="space-y-5">
                <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2.5">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <h3 className="text-[11.5px] font-extrabold text-slate-700 uppercase tracking-widest">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-600 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Display Name</span>
                    </label>
                    <input 
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter full name"
                      className="profile-form-input font-medium"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-600 flex items-center space-x-1">
                      <span>@</span>
                      <span>Unique Username</span>
                    </label>
                    <motion.div 
                      animate={shakeUsername ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className={`relative flex items-center border rounded-xl transition-all duration-300 ${
                        usernameStatus === 'checking' ? 'border-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.08)] bg-white/70' :
                        usernameStatus === 'available' ? 'border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.12)] bg-emerald-50/5' :
                        usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.12)] bg-rose-50/5' :
                        'border-slate-200/70 bg-white/80'
                      }`}
                    >
                      <input 
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter username"
                        className="w-full bg-transparent border-none py-2.5 px-3.5 pr-10 text-[12.5px] font-medium outline-none text-slate-700"
                      />
                      
                      {/* Realtime status indicators */}
                      <div className="absolute right-3.5 flex items-center justify-center pointer-events-none">
                        <AnimatePresence mode="wait">
                          {usernameStatus === 'checking' && (
                            <motion.div
                              key="checking"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="text-violet-500"
                            >
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </motion.div>
                          )}
                          {usernameStatus === 'available' && (
                            <motion.div
                              key="available"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="text-emerald-500"
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          )}
                          {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                            <motion.div
                              key="error"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="text-rose-500"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                    
                    {/* Inline message feedback */}
                    <AnimatePresence>
                      {usernameMessage && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`flex items-center text-[10px] font-bold pl-1.5 mt-0.5 overflow-hidden transition-colors ${
                            usernameStatus === 'available' ? 'text-emerald-600' :
                            usernameStatus === 'checking' ? 'text-violet-600 animate-pulse' :
                            'text-rose-500'
                          }`}
                        >
                          <span>{usernameMessage}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-600 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address</span>
                    </label>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter email address"
                      className="profile-form-input font-medium"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-600 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone Number</span>
                    </label>
                    <motion.div 
                      animate={shakePhone ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className={`relative flex items-center border rounded-xl transition-all duration-300 ${
                        phoneStatus === 'checking' ? 'border-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.08)] bg-white/70' :
                        phoneStatus === 'available' ? 'border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.12)] bg-emerald-50/5' :
                        phoneStatus === 'taken' || phoneStatus === 'invalid' ? 'border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.12)] bg-rose-50/5' :
                        'border-slate-200/70 bg-white/80'
                      }`}
                    >
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-transparent border-none py-2.5 px-3.5 pr-10 text-[12.5px] font-medium outline-none text-slate-700"
                      />
                      
                      {/* Realtime status indicators */}
                      <div className="absolute right-3.5 flex items-center justify-center pointer-events-none">
                        <AnimatePresence mode="wait">
                          {phoneStatus === 'checking' && (
                            <motion.div
                              key="checking"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="text-violet-500"
                            >
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </motion.div>
                          )}
                          {phoneStatus === 'available' && (
                            <motion.div
                              key="available"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="text-emerald-500"
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          )}
                          {(phoneStatus === 'taken' || phoneStatus === 'invalid') && (
                            <motion.div
                              key="error"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="text-rose-500"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                    
                    {/* Inline message feedback */}
                    <AnimatePresence>
                      {phoneMessage && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`flex items-center text-[10px] font-bold pl-1.5 mt-0.5 overflow-hidden transition-colors ${
                            phoneStatus === 'available' ? 'text-emerald-600' :
                            phoneStatus === 'checking' ? 'text-violet-600 animate-pulse' :
                            'text-rose-500'
                          }`}
                        >
                          <span>{phoneMessage}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* Gradient Picker */}
                <div className="space-y-1.5 border-t border-slate-100/50 pt-3">
                  <label className="text-[11px] font-extrabold text-slate-600 block">
                    🎨 Initials Background Fallback
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {gradients.map((grad, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatarColor: grad.value }))}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-white bg-gradient-to-tr ${grad.value} shadow-sm border transition-all cursor-pointer flex items-center space-x-1 ${
                          formData.avatarColor === grad.value ? 'ring-2 ring-indigo-500 scale-102 border-white' : 'border-transparent opacity-80'
                        }`}
                      >
                        {formData.avatarColor === grad.value && <Check className="w-2.5 h-2.5" />}
                        <span>{grad.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* -------------------- 4. SUBMIT FORM ACTIONS (Cancel, Save Changes) -------------------- */}
              <AnimatePresence>
                {hasChanges() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100/50 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (originalData) {
                          setFormData({
                            fullName: originalData.fullName,
                            username: originalData.username,
                            email: originalData.email,
                            bio: originalData.bio,
                            phone: originalData.phone,
                            location: originalData.location,
                            website: originalData.website,
                            statusMessage: originalData.statusMessage,
                            avatarColor: originalData.avatarColor
                          });
                          setAvatarPreview(originalData.avatar);
                          setIsInitialLoad(true);
                        }
                      }}
                      className="px-4.5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-[12px] font-bold text-slate-500 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="profile-save-btn flex items-center space-x-1.5"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

            </form>
          </motion.div>

        </section>

      </main>

      {/* Floating Success / Error Glass Toast Banners */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="profile-toast-banner"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Details */}
      <footer className="w-full text-center py-6 text-[10px] text-slate-400/80 font-bold select-none mt-6">
        <div className="flex items-center justify-center space-x-1">
          <span>Bloop Messenger System v1.2</span>
          <span>•</span>
          <span>Persisted on MySQL local schema</span>
          <span>•</span>
          <span>Handcrafted with</span>
          <Heart className="w-3 h-3 text-rose-400 animate-pulse" />
        </div>
      </footer>

      {/* Frosted Glass OTP Verification Modal Overlay */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[8px]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-[440px] bg-white/75 backdrop-blur-[20px] rounded-[28px] border border-white/60 p-6.5 shadow-2xl relative overflow-hidden flex flex-col justify-start items-stretch"
            >
              {/* Giant Ambient Glow */}
              <div className="absolute top-[-100px] right-[-100px] w-[200px] h-[200px] rounded-full bg-violet-400/20 blur-[60px] pointer-events-none -z-10" />
              <div className="absolute bottom-[-100px] left-[-100px] w-[200px] h-[200px] rounded-full bg-cyan-400/20 blur-[60px] pointer-events-none -z-10" />

              {/* Close Button */}
              <button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    email: originalData.email
                  }));
                  setShowOtpModal(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border border-slate-100 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 relative">
                  <Mail className="w-6 h-6 animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl bg-indigo-400/10 blur-sm -z-10" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-[17px] font-bold text-slate-800 tracking-tight">
                    Verify Your New Email
                  </h3>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed max-w-[320px]">
                    We sent a 6-digit verification code to your new email address.
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-indigo-50/70 border border-indigo-100/50 text-[12.5px] font-bold text-indigo-600 font-mono tracking-wide">
                  {formData.email}
                </div>
              </div>

              {/* OTP Digit inputs */}
              <div className="flex items-center justify-between space-x-2 my-6.5">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    autoFocus={idx === 0}
                    className="w-12 h-13 rounded-xl border border-slate-200 text-center text-[19px] font-extrabold text-slate-800 bg-white/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-mono shadow-sm"
                  />
                ))}
              </div>

              {/* Feedback text */}
              {otpError && (
                <div className="flex items-center justify-center space-x-1.5 mb-4 text-[12px] text-rose-500 font-bold bg-rose-50/50 border border-rose-100/50 rounded-xl py-2 px-3 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && (
                <div className="flex items-center justify-center space-x-1.5 mb-4 text-[12px] text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100/50 rounded-xl py-2 px-3">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>✓ Email verified successfully</span>
                </div>
              )}

              {/* Verification and Resend Actions */}
              <div className="flex flex-col space-y-3 pt-2">
                <motion.button
                  disabled={otpLoading || otpSuccess}
                  onClick={handleVerifyOtp}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-[12.5px] shadow-lg shadow-indigo-300/40 cursor-pointer flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Email</span>
                    </>
                  )}
                </motion.button>

                <div className="flex items-center justify-center space-x-2 text-[11px] font-bold text-slate-400 select-none">
                  {resendTimer > 0 ? (
                    <span className="text-slate-400/80">
                      Resend available in {resendTimer} seconds
                    </span>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer transition-colors"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
