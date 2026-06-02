import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Github,
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import './Register.css';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeTerms: false
  });

  // Step state (1: personal info, 2: account credentials)
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Focus tracking for floating labels
  const [focused, setFocused] = useState({});

  // Errors states
  const [errors, setErrors] = useState({});
  // Touched states to prevent premature validation errors
  const [touched, setTouched] = useState({});
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Real-time Username availability check states
  const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameMessage, setUsernameMessage] = useState('');
  const [shakeUsername, setShakeUsername] = useState(false);

  // Debounced real-time username availability validation
  useEffect(() => {
    const username = formData.username;
    if (!username) {
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
      axios.get(`${apiUrl}/api/auth/check-username/${normalized}`)
        .then(res => {
          if (res.data.available) {
            setUsernameStatus('available');
            setUsernameMessage('Username available');
            // Clear frontend form errors for username
            setErrors(prev => ({ ...prev, username: '' }));
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
  }, [formData.username]);

  // Focus helpers
  const handleFocus = (name) => {
    setFocused(prev => ({ ...prev, [name]: true }));
  };

  const handleInputBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFocused(prev => ({ ...prev, [name]: false }));
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, finalValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validation rules
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (typeof value === 'string' && !value.trim()) {
          error = 'Full name is required';
        }
        break;
      case 'username':
        if (typeof value === 'string' && !value.trim()) {
          error = 'Username is required';
        } else if (typeof value === 'string' && value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (typeof value === 'string' && !/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Only letters, numbers, and underscores are allowed';
        }
        break;
      case 'email':
        if (typeof value === 'string' && !value.trim()) {
          error = 'Email address is required';
        } else if (typeof value === 'string' && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
          error = 'Invalid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          error = 'Must contain at least 1 letter and 1 number';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Confirm password is required';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'agreeTerms':
        if (!value) {
          error = 'You must agree to the Terms & Conditions';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Run validation when form fields change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    if (touched[name]) {
      const error = validateField(name, checked);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Custom password dependency check: re-validate confirm password if password changes
  useEffect(() => {
    if (touched.confirmPassword) {
      const error = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  }, [formData.password]);

  // Step 1 Validation & Navigation
  const handleNextStep = (e) => {
    e.preventDefault();
    
    const step1Fields = ['fullName', 'email'];
    
    // Mark fields as touched
    const updatedTouched = { ...touched };
    step1Fields.forEach(field => {
      updatedTouched[field] = true;
    });
    setTouched(updatedTouched);

    // Validate fields
    const updatedErrors = { ...errors };
    let hasErrors = false;
    
    step1Fields.forEach(field => {
      const error = validateField(field, formData[field]);
      updatedErrors[field] = error;
      if (error) {
        hasErrors = true;
      }
    });

    setErrors(updatedErrors);

    if (!hasErrors) {
      setDirection(1);
      setStep(2);
    }
  };

  // Back to Step 1
  const handleBackStep = () => {
    setDirection(-1);
    setStep(1);
  };

  // Submit Final Step
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const step2Fields = ['username', 'password', 'confirmPassword', 'agreeTerms'];
    
    // Mark as touched
    const updatedTouched = { ...touched };
    step2Fields.forEach(field => {
      updatedTouched[field] = true;
    });
    setTouched(updatedTouched);

    // Validate
    const updatedErrors = { ...errors };
    let hasErrors = false;

    step2Fields.forEach(field => {
      const value = field === 'agreeTerms' ? formData.agreeTerms : formData[field];
      const error = validateField(field, value);
      updatedErrors[field] = error;
      if (error) {
        hasErrors = true;
      }
    });

    setErrors(updatedErrors);

    if (usernameStatus !== 'available') {
      setShakeUsername(true);
      setTimeout(() => setShakeUsername(false), 500);
      return;
    }

    if (!hasErrors) {
      setIsLoading(true);
      
      // Real backend registration API call using Axios
      axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password
      })
      .then(response => {
        setIsLoading(false);
        if (response.status === 201) {
          setIsSuccess(true);
        }
      })
      .catch(error => {
        setIsLoading(false);
        const data = error.response ? error.response.data : {};
        // Map backend duplicate errors to form state errors
        if (data.message && (data.message.includes('username') || data.message.includes('Username'))) {
          setErrors(prev => ({ ...prev, username: data.message }));
          setStep(2); // Ensure we stay on Step 2 to show username error
        } else if (data.message && (data.message.includes('email') || data.message.includes('Email'))) {
          setErrors(prev => ({ ...prev, email: data.message }));
          setStep(1); // Slide back to Step 1 to show email error
        } else {
          alert(data.message || 'Registration failed.');
        }
      });
    }
  };

  // Social actions
  // Load Google Identity Services script dynamically
  useEffect(() => {
    // If window.google is already loaded globally, initialize it directly
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '923984501234-placeholder.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });
      } catch (err) {
        console.warn('Google client already initialized:', err);
      }
      return;
    }

    // Check if the script tag already exists in the DOM to avoid duplication
    let script = document.getElementById('google-gsi-client');
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '923984501234-placeholder.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });
        } catch (err) {
          console.warn('Google client initialization error:', err);
        }
      }
    };

    script.addEventListener('load', handleLoad);

    return () => {
      // Do not remove the script tag in cleanup so window.google persists across re-renders
      if (script) {
        script.removeEventListener('load', handleLoad);
      }
    };
  }, []);

  const handleGoogleCredentialResponse = (response) => {
    setIsLoading(true);

    // If standard OAuth2 token flow response (contains access_token)
    if (response && response.access_token) {
      axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`)
        .then(userinfoRes => {
          const profile = userinfoRes.data;
          // Post the retrieved profile details straight to registration backend
          axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/register`, {
            fullName: profile.name || 'Google User',
            email: profile.email,
            username: profile.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 100),
            password: `google_oauth_${Math.random().toString(36).substring(2, 10)}`
          })
          .then(regRes => {
            setIsLoading(false);
            if (regRes.status === 201 || regRes.status === 200) {
              setFormData(prev => ({
                ...prev,
                fullName: profile.name || 'Google User',
                email: profile.email,
                username: profile.email.split('@')[0]
              }));
              setIsSuccess(true);
            }
          })
          .catch(regErr => {
            setIsLoading(false);
            const data = regErr.response ? regErr.response.data : {};
            if (data.message && data.message.toLowerCase().includes('already')) {
              setFormData(prev => ({
                ...prev,
                fullName: profile.name || 'Google User',
                email: profile.email,
                username: profile.email.split('@')[0]
              }));
              setIsSuccess(true);
            } else {
              alert(data.message || 'Google registration failed.');
            }
          });
        })
        .catch(err => {
          setIsLoading(false);
          console.error('❌ Google userinfo fetch error:', err);
          alert('Could not fetch user profile details from Google.');
        });
      return;
    }

    // Fallback: If JWT credentials ID token response
    if (response && response.credential) {
      axios.post(`${import.meta.env.VITE_API_URL || 'https://bloop-af6u.onrender.com'}/api/auth/google-register`, {
        credential: response.credential
      })
      .then(res => {
        setIsLoading(false);
        const data = res.data;
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            fullName: data.user.fullName,
            email: data.user.email,
            username: data.user.username
          }));
          setIsSuccess(true);
        }
      })
      .catch(err => {
        setIsLoading(false);
        const data = err.response ? err.response.data : {};
        alert(data.message || 'Google registration failed.');
      });
    } else {
      setIsLoading(false);
    }
  };

  // Social actions
  const handleSocialRegister = (provider) => {
    if (provider === 'Google') {
      if (window.google) {
        try {
          // Initialize standard OAuth popup client (bypasses One Tap cookie blocks)
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '923984501234-placeholder.apps.googleusercontent.com',
            scope: 'email profile openid',
            callback: handleGoogleCredentialResponse
          });
          tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (e) {
          console.error('❌ GIS init error:', e);
          alert('Failed to initialize Google Sign-In popup client.');
        }
      } else {
        alert('Google Sign-In is still loading. Please try again in a few seconds.');
      }
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert(`Creating Bloop account via ${provider}...`);
      }, 1500);
    }
  };

  // Framer Motion Animation Variants for Slide Wizard
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0
    })
  };

  // Style classes
  const inputContainerClasses = "relative flex items-center";
  const iconClasses = "absolute left-4 w-4.5 h-4.5 transition-colors duration-300 pointer-events-none";
  const labelClasses = "absolute left-11 transition-all duration-300 pointer-events-none select-none text-[13.5px]";
  const errorIconClasses = "w-3.5 h-3.5 text-rose-500 mr-1.5 shrink-0";

  return (
    <div className="register-container seamless-cosmic-bg relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      




      {/* ================= LEFT SIDE: Immersive Cosmic Branding (Hidden on mobile/tablet) ================= */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden bg-transparent">
        
        {/* Header Branding */}
        <div className="flex items-center space-x-3 select-none z-10">
          <div 
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-md shadow-pink-300/30 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Bloop
          </span>
        </div>

        {/* Layer 3: Main Onboarding Scene - Cosmic Connection Portal */}
        <div className="relative w-full max-w-[340px] h-[340px] mx-auto my-auto z-10 select-none float-visual">
          
          {/* Orbital Rings - Portal Structure */}
          <div className="absolute inset-0 border-[2.5px] border-violet-400/25 rounded-full portal-ring pointer-events-none" />
          <div className="absolute inset-[25px] border-[2px] border-dashed border-pink-400/20 rounded-full portal-ring pointer-events-none orbit-cw" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-[50px] border border-orange-400/15 rounded-full portal-ring pointer-events-none orbit-ccw" style={{ animationDelay: '2s' }} />

          {/* Central Massive Glowing Cosmic Portal Core */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-tr from-violet-500 via-pink-500 to-orange-400 shadow-[0_0_80px_rgba(219,39,119,0.35)] flex items-center justify-center border border-white/30"
          >
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Curved glowing connection lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 170 170 L 60 70" stroke="rgba(167, 139, 250, 0.45)" strokeWidth="2.5" className="dashed-line" />
            <path d="M 170 170 L 280 110" stroke="rgba(244, 114, 182, 0.45)" strokeWidth="2.5" className="dashed-line" />
            <path d="M 170 170 L 190 270" stroke="rgba(251, 146, 60, 0.45)" strokeWidth="2" className="dashed-line" />
          </svg>

          {/* Holographic Identity Card A (Top Left) */}
          <div
            className="absolute left-[60px] top-[70px] -translate-x-1/2 -translate-y-1/2 holo-id-card rounded-xl p-2.5 w-28 border border-white/70 select-none shadow-md"
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-400 to-pink-400 flex items-center justify-center text-[7px] text-white font-bold shadow-sm">U1</div>
              <div className="flex-1 min-w-0">
                <p className="text-[7.5px] font-bold text-slate-700 truncate">Alex_Node</p>
                <p className="text-[5.5px] text-emerald-500 font-bold uppercase tracking-widest">Active</p>
              </div>
            </div>
            <div className="h-[1.5px] bg-slate-100/50 w-full my-1"></div>
            <p className="text-[6px] text-slate-400 font-mono truncate">NODE.0x88A</p>
          </div>

          {/* Holographic Identity Card B (Top Right) */}
          <div
            className="absolute left-[280px] top-[110px] -translate-x-1/2 -translate-y-1/2 holo-id-card rounded-xl p-2.5 w-28 border border-white/70 select-none shadow-md"
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-400 to-orange-400 flex items-center justify-center text-[7px] text-white font-bold shadow-sm">U2</div>
              <div className="flex-1 min-w-0">
                <p className="text-[7.5px] font-bold text-slate-700 truncate">Sarah_Node</p>
                <p className="text-[5.5px] text-slate-400 uppercase tracking-widest">Connected</p>
              </div>
            </div>
            <div className="h-[1.5px] bg-slate-100/50 w-full my-1"></div>
            <p className="text-[6px] text-slate-400 font-mono truncate">NODE.0x71F</p>
          </div>

          {/* Holographic Identity Card C (Bottom) */}
          <div
            className="absolute left-[190px] top-[270px] -translate-x-1/2 -translate-y-1/2 holo-id-card rounded-xl p-2.5 w-28 border border-white/70 select-none shadow-md"
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-400 to-violet-400 flex items-center justify-center text-[7px] text-white font-bold shadow-sm">U3</div>
              <div className="flex-1 min-w-0">
                <p className="text-[7.5px] font-bold text-slate-700 truncate">Bloop_Core</p>
                <p className="text-[5.5px] text-indigo-500 font-bold uppercase tracking-widest">Online</p>
              </div>
            </div>
            <div className="h-[1.5px] bg-slate-100/50 w-full my-1"></div>
            <p className="text-[6px] text-slate-400 font-mono truncate">NODE.0x99B</p>
          </div>

          {/* Translucent Crystals */}
          <div
            className="absolute left-[20px] top-[180px] w-8 h-10 holographic-crystal"
          />
          <div
            className="absolute left-[295px] top-[200px] w-7 h-9 holographic-crystal"
            style={{ transform: "rotate(35deg)" }}
          />
        </div>

        {/* Bottom Quote section */}
        <div className="z-10 mt-auto max-w-sm select-none">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2 leading-tight">
            Step into a world{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400">
              built for connection.
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Create your space inside a beautifully connected digital experience.
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE: Centered Frosted Light Card (Stacked on mobile) ================= */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 md:p-12 relative min-h-screen overflow-y-auto bg-transparent">
        {/* Forms wrapper */}
        <div className="relative w-full max-w-[400px] z-10 flex flex-col space-y-4">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <div
                 className="frosted-light-card w-full rounded-[32px] px-6 py-8 md:p-8 flex flex-col items-center justify-between min-h-[460px]"
              >
                {/* Back Arrow Button (Visible only in Step 2) */}
                <AnimatePresence>
                  {step === 2 && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      type="button"
                      onClick={handleBackStep}
                      className="absolute left-6 top-7 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Header (visible on mobile only, hidden on desktop since desktop has left-side branding) */}
                <div className="w-full flex flex-col items-center mb-5 text-center select-none lg:hidden">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-md mb-2.5">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-1">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400">
                      Bloop
                    </span>
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Join the conversation.
                  </p>
                </div>

                {/* Form Title (visible on desktop) */}
                <div className="w-full text-center hidden lg:block select-none mb-4.5">
                  <h2 className="text-xl font-extrabold text-slate-800">Create Account</h2>
                  <p className="text-xs text-slate-400 mt-1">Provide your details to connect instantly.</p>
                </div>

                {/* Form step indicator bar */}
                <div className="w-full flex items-center space-x-1.5 mb-5 px-1 select-none">
                  <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-violet-500' : 'bg-slate-200'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-violet-500' : 'bg-slate-200'}`} />
                </div>

                {/* Form body */}
                <div className="w-full flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait" custom={direction}>
                    {step === 1 ? (
                      <motion.div
                        key="step1"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full space-y-3.5"
                      >
                        {/* Full Name */}
                        <div className="flex flex-col">
                          <div className={inputContainerClasses}>
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              onFocus={() => handleFocus('fullName')}
                              onBlur={handleInputBlur}
                              className="light-input w-full pl-11 pr-4 pt-5 pb-1.5 rounded-xl text-[14px] placeholder-transparent outline-none"
                            />
                            <label
                              className={`${labelClasses} ${
                                formData.fullName || focused.fullName 
                                  ? 'top-1.5 text-[9.5px] text-violet-500 font-semibold' 
                                  : 'top-3.5 text-slate-400'
                              }`}
                            >
                              Full Name
                            </label>
                            <User className={`${iconClasses} top-3.5 ${
                              formData.fullName || focused.fullName ? 'text-violet-500' : 'text-slate-400'
                            }`} />
                          </div>
                          <AnimatePresence>
                            {touched.fullName && errors.fullName && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-[11px] text-rose-500 pl-1 mt-1 overflow-hidden"
                              >
                                <AlertCircle className={errorIconClasses} />
                                <span>{errors.fullName}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Email Address */}
                        <div className="flex flex-col">
                          <div className={inputContainerClasses}>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              onFocus={() => handleFocus('email')}
                              onBlur={handleInputBlur}
                              className="light-input w-full pl-11 pr-4 pt-5 pb-1.5 rounded-xl text-[14px] placeholder-transparent outline-none"
                            />
                            <label
                              className={`${labelClasses} ${
                                formData.email || focused.email 
                                  ? 'top-1.5 text-[9.5px] text-violet-500 font-semibold' 
                                  : 'top-3.5 text-slate-400'
                              }`}
                            >
                              Email Address
                            </label>
                            <Mail className={`${iconClasses} top-3.5 ${
                              formData.email || focused.email ? 'text-violet-500' : 'text-slate-400'
                            }`} />
                          </div>
                          <AnimatePresence>
                            {touched.email && errors.email && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-[11px] text-rose-500 pl-1 mt-1 overflow-hidden"
                              >
                                <AlertCircle className={errorIconClasses} />
                                <span>{errors.email}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Next button */}
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="button"
                          onClick={handleNextStep}
                          className="vibrant-gradient-btn w-full text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 text-[14px] cursor-pointer mt-5 select-none"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full space-y-3.5"
                      >
                        {/* Username */}
                        <div className="flex flex-col">
                          <motion.div 
                            animate={shakeUsername ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className={`${inputContainerClasses} border rounded-xl transition-all duration-300 ${
                              usernameStatus === 'checking' ? 'border-indigo-300/60 shadow-[0_0_8px_rgba(99,102,241,0.08)] bg-white/70' :
                              usernameStatus === 'available' ? 'border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.12)] bg-emerald-50/5' :
                              usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-rose-400/50 shadow-[0_0_8px_rgba(244,63,94,0.12)] bg-rose-50/5' :
                              'border-transparent'
                            }`}
                          >
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              onFocus={() => handleFocus('username')}
                              onBlur={handleInputBlur}
                              className="light-input w-full pl-11 pr-11 pt-5 pb-1.5 rounded-xl text-[14px] placeholder-transparent outline-none bg-transparent"
                            />
                            <label
                              className={`${labelClasses} ${
                                formData.username || focused.username 
                                  ? 'top-1.5 text-[9.5px] text-violet-500 font-semibold' 
                                  : 'top-3.5 text-slate-400'
                              }`}
                            >
                              Username
                            </label>
                            <span className={`absolute left-4 top-3.5 font-bold text-base leading-none select-none transition-colors duration-300 ${
                              formData.username || focused.username ? 'text-violet-500' : 'text-slate-400'
                            }`}>@</span>
                            
                            {/* Realtime status indicators */}
                            <div className="absolute right-4 flex items-center justify-center">
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
                                    <CheckCircle2 className="w-4 h-4 fill-emerald-50" />
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
                                    <AlertCircle className="w-4 h-4 fill-rose-50" />
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
                                className={`flex items-center text-[10.5px] font-bold pl-1.5 mt-1 overflow-hidden transition-colors ${
                                  usernameStatus === 'available' ? 'text-emerald-600' :
                                  usernameStatus === 'checking' ? 'text-violet-600 animate-pulse' :
                                  'text-rose-500'
                                }`}
                              >
                                {usernameStatus === 'available' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {usernameStatus === 'checking' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <AlertCircle className="w-3 h-3 mr-1" />}
                                <span>{usernameMessage}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col">
                          <div className={inputContainerClasses}>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              onFocus={() => handleFocus('password')}
                              onBlur={handleInputBlur}
                              className="light-input w-full pl-11 pr-11 pt-5 pb-1.5 rounded-xl text-[14px] placeholder-transparent outline-none"
                            />
                            <label
                              className={`${labelClasses} ${
                                formData.password || focused.password 
                                  ? 'top-1.5 text-[9.5px] text-violet-500 font-semibold' 
                                  : 'top-3.5 text-slate-400'
                              }`}
                            >
                              Password
                            </label>
                            <Lock className={`${iconClasses} top-3.5 ${
                              formData.password || focused.password ? 'text-violet-500' : 'text-slate-400'
                            }`} />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <AnimatePresence>
                            {touched.password && errors.password && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-[11px] text-rose-500 pl-1 mt-1 overflow-hidden"
                              >
                                <AlertCircle className={errorIconClasses} />
                                <span>{errors.password}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col">
                          <div className={inputContainerClasses}>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              onFocus={() => handleFocus('confirmPassword')}
                              onBlur={handleInputBlur}
                              className="light-input w-full pl-11 pr-11 pt-5 pb-1.5 rounded-xl text-[14px] placeholder-transparent outline-none"
                            />
                            <label
                              className={`${labelClasses} ${
                                formData.confirmPassword || focused.confirmPassword 
                                  ? 'top-1.5 text-[9.5px] text-violet-500 font-semibold' 
                                  : 'top-3.5 text-slate-400'
                              }`}
                            >
                              Confirm Password
                            </label>
                            <Lock className={`${iconClasses} top-3.5 ${
                              formData.confirmPassword || focused.confirmPassword ? 'text-violet-500' : 'text-slate-400'
                            }`} />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <AnimatePresence>
                            {touched.confirmPassword && errors.confirmPassword && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-[11px] text-rose-500 pl-1 mt-1 overflow-hidden"
                              >
                                <AlertCircle className={errorIconClasses} />
                                <span>{errors.confirmPassword}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Agreement checkboxes: Remember me & Terms & Conditions */}
                        <div className="flex flex-col space-y-2 pt-1 select-none">
                          {/* Remember Me */}
                          <label className="flex items-center space-x-2.5 cursor-pointer group text-slate-500 hover:text-slate-700 transition-colors">
                            <input
                              type="checkbox"
                              name="rememberMe"
                              checked={formData.rememberMe}
                              onChange={handleCheckboxChange}
                              className="sr-only peer"
                            />
                            <div className="w-4 h-4 rounded border border-slate-200 bg-white/40 flex items-center justify-center peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-pink-500 peer-checked:border-pink-500 transition-all duration-200">
                              <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-[12px] font-medium">Remember me</span>
                          </label>

                          {/* Terms & Conditions */}
                          <div className="flex flex-col">
                            <label className="flex items-center space-x-2.5 cursor-pointer group text-slate-500 hover:text-slate-700 transition-colors">
                              <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleCheckboxChange}
                                onBlur={handleInputBlur}
                                className="sr-only peer"
                              />
                              <div className="w-4 h-4 rounded border border-slate-200 bg-white/40 flex items-center justify-center peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-pink-500 peer-checked:border-pink-500 transition-all duration-200">
                                <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-[12px] font-medium">I agree to the Terms & Conditions</span>
                            </label>
                            <AnimatePresence>
                              {touched.agreeTerms && errors.agreeTerms && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex items-center text-[11px] text-rose-500 pl-1 mt-1 overflow-hidden"
                                >
                                  <AlertCircle className={errorIconClasses} />
                                  <span>{errors.agreeTerms}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Submit button */}
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="submit"
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="vibrant-gradient-btn w-full text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 text-[14px] cursor-pointer mt-4 select-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-1.5">
                              <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Creating Account...</span>
                            </div>
                          ) : (
                            <>
                              <span>Create Account</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Minimal Divider with Animated OR */}
                <div className="relative w-full flex items-center justify-center my-4 select-none">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <motion.span 
                    whileHover={{ scale: 1.1 }}
                    className="relative bg-white border border-slate-100 px-2.5 py-0.5 rounded-full text-[8.5px] text-slate-400 font-bold uppercase tracking-widest cursor-default"
                  >
                    OR
                  </motion.span>
                </div>

                {/* Social Login Buttons */}
                <div className="flex flex-col space-y-2 w-full">
                  <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(0,0,0,0.02)' }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => handleSocialRegister('Google')}
                    className="light-input w-full flex items-center justify-center space-x-2.5 py-2.5 rounded-xl cursor-pointer select-none text-[13px] text-slate-600 font-medium transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(0,0,0,0.02)' }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => handleSocialRegister('GitHub')}
                    className="light-input w-full flex items-center justify-center space-x-2.5 py-2.5 rounded-xl cursor-pointer select-none text-[13px] text-slate-600 font-medium transition-all"
                  >
                    <Github className="w-4 h-4 text-slate-800" />
                    <span>Continue with GitHub</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              // Success Screen
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="frosted-light-card w-full rounded-3xl p-8 md:p-10 flex flex-col items-center text-center justify-center min-h-[460px]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                  className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </motion.div>

                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Registration Successful!
                </h2>
                
                <div className="text-slate-500 max-w-sm text-[14px] space-y-3 mb-7 leading-relaxed">
                  <p>
                    Welcome to <strong className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">Bloop</strong>, <span className="text-slate-850 font-semibold">{formData.fullName}</span>!
                  </p>
                  <p className="text-xs text-slate-400">
                    We've sent a verification link to your email <span className="text-slate-600 font-medium">{formData.email}</span>. Please verify to activate instant chat.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate('/chat')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 text-[14px] cursor-pointer"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Redirect Card */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="frosted-light-card w-full rounded-2xl py-4 px-6 text-center select-none"
          >
            <span className="text-[13px] text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-600 hover:text-violet-700 font-bold transition-colors hover:underline">
                Login
              </Link>
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
