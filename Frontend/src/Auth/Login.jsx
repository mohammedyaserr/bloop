import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Github,
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import './Login.css';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  // Form states
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    rememberMe: false
  });

  // Focus tracking for floating labels
  const [focused, setFocused] = useState({});

  // Errors & Touched states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Focus helpers
  const handleFocus = (name) => {
    setFocused(prev => ({ ...prev, [name]: true }));
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    setFocused(prev => ({ ...prev, [name]: false }));
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validation rules
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'emailOrUsername':
        if (!value.trim()) {
          error = 'Email or username is required';
        } else if (value.trim().length < 3) {
          error = 'Must be at least 3 characters';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Run validation on change
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const fields = ['emailOrUsername', 'password'];
    
    // Mark all as touched
    const updatedTouched = { ...touched };
    fields.forEach(field => {
      updatedTouched[field] = true;
    });
    setTouched(updatedTouched);

    // Validate
    const updatedErrors = {};
    let hasErrors = false;
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      updatedErrors[field] = error;
      if (error) {
        hasErrors = true;
      }
    });

    setErrors(updatedErrors);

    if (!hasErrors) {
      setIsLoading(true);
      
      // Real backend login API call using Axios
      axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/auth/login`, {
        emailOrUsername: formData.emailOrUsername,
        password: formData.password
      })
      .then(response => {
        setIsLoading(false);
        if (response.status === 200 && response.data && response.data.user) {
          localStorage.setItem('bloop_user', JSON.stringify(response.data.user));
          navigate('/chat');
        }
      })
      .catch(error => {
        setIsLoading(false);
        const data = error.response ? error.response.data : {};
        setErrors(prev => ({
          ...prev,
          emailOrUsername: data.message || 'Invalid email/username or password.',
          password: data.message || 'Invalid email/username or password.'
        }));
      });
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Connecting to Bloop account via ${provider}...`);
    }, 1500);
  };

  // Styling helpers
  const inputContainerClasses = "relative flex items-center";
  const iconClasses = "absolute left-4 w-4.5 h-4.5 transition-colors duration-300 pointer-events-none";
  const labelClasses = "absolute left-11 transition-all duration-300 pointer-events-none select-none text-[13.5px]";
  const errorIconClasses = "w-3.5 h-3.5 text-rose-500 mr-1.5 shrink-0";

  return (
    <div className="login-container seamless-cyan-bg relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      
      {/* Layer 1: Giant Full-Page Animated Glowing Orbs & Mesh */}
      <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-cyan-300/20 blur-[120px] pointer-events-none -z-10 animate-float-1" />
      <div className="absolute bottom-[10%] right-[5%] w-[420px] h-[420px] rounded-full bg-sky-200/25 blur-[130px] pointer-events-none -z-10 animate-float-2" />
      <div className="absolute top-[30%] right-[30%] w-[380px] h-[380px] rounded-full bg-teal-200/15 blur-[110px] pointer-events-none -z-10 animate-float-3" />
      <div className="absolute bottom-[25%] left-[25%] w-[300px] h-[300px] rounded-full bg-cyan-100/15 blur-[100px] pointer-events-none -z-10" />

      {/* Ambient Sparks / Sparkles / Particles floating across the entire page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute w-2 h-2 rounded-full bg-cyan-400/40 left-[12%] top-[20%] particle" style={{ animationDelay: '0.5s', animationDuration: '6s' }} />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-teal-400/30 left-[75%] top-[40%] particle" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-sky-300/40 left-[25%] top-[75%] particle" style={{ animationDelay: '1.2s', animationDuration: '7s' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-white left-[50%] top-[15%] particle" style={{ animationDelay: '1.8s', animationDuration: '5s' }} />
      </div>
      
      {/* ================= LEFT SIDE: Immersive Branding & Mockup (Hidden on mobile/tablet) ================= */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden bg-transparent">
        
        {/* Header Branding */}
        <div className="flex items-center space-x-3 select-none z-10">
          <motion.div 
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-teal-400 flex items-center justify-center shadow-md shadow-cyan-300/30 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Bloop
          </span>
        </div>

        {/* Layer 3: Main Creative Interface Panel */}
        <div className="relative w-full max-w-[340px] h-[340px] mx-auto my-auto z-10 select-none float-visual">
          
          {/* Wave-like glowing connection lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 85 85 C 160 80, 180 200, 255 170" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="2.5" className="dashed-line" />
            <path d="M 255 170 C 200 240, 150 210, 120 280" stroke="rgba(45, 212, 191, 0.45)" strokeWidth="2.5" className="dashed-line" />
            <path d="M 85 85 C 60 160, 60 220, 120 280" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="2" className="dashed-line" />
          </svg>

          {/* User Avatar A */}
          <div className="absolute left-[85px] top-[85px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-200 to-cyan-100 border-2 border-white flex items-center justify-center font-bold text-cyan-800 shadow-md animate-float-1">
              A
            </div>
            {/* Small active badge */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></span>
          </div>

          {/* User Avatar B */}
          <div className="absolute left-[255px] top-[170px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-teal-200 to-teal-100 border-2 border-white flex items-center justify-center font-bold text-teal-800 shadow-md animate-float-2">
              S
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></span>
          </div>

          {/* User Avatar C */}
          <div className="absolute left-[120px] top-[280px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-200 to-sky-100 border-2 border-white flex items-center justify-center font-bold text-sky-800 shadow-md animate-float-3">
              E
            </div>
            {/* Active connection badge */}
            <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-[9.5px]">✨</span>
          </div>

          {/* Translucent Glass Message Panel A */}
          <div className="absolute left-[120px] top-[45px] -translate-x-1/2 abstract-msg-card rounded-2xl py-2.5 px-3.5 max-w-[140px] border border-white/60">
            <div className="flex items-center space-x-1.5 mb-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="text-[8px] font-bold text-cyan-600 uppercase tracking-wider">New message</span>
            </div>
            <p className="text-[10px] text-slate-700 font-semibold leading-snug">Let's catch up! 👋</p>
          </div>

          {/* Translucent Glass Message Panel B */}
          <div className="absolute left-[245px] top-[230px] -translate-x-1/2 abstract-msg-card rounded-2xl py-2.5 px-3.5 max-w-[140px] border border-white/60 shadow-lg shadow-cyan-100/10">
            <div className="flex items-center space-x-1.5 mb-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Session Active</span>
            </div>
            <p className="text-[10px] text-slate-700 font-semibold leading-snug">Restoring chats...</p>
            {/* Custom mini typing indicator */}
            <div className="flex items-center space-x-0.5 mt-1.5">
              <div className="typing-dot w-1 h-1 bg-cyan-400"></div>
              <div className="typing-dot w-1 h-1 bg-cyan-400"></div>
              <div className="typing-dot w-1 h-1 bg-cyan-400"></div>
            </div>
          </div>

          {/* Floating 3D-Like Translucent Spheres */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute left-[250px] top-[40px] w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-300/15 via-sky-300/20 to-teal-300/15 shadow-inner border border-white/40 backdrop-blur-[3px]"
          />
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute left-[30px] top-[260px] w-8 h-8 rounded-full bg-gradient-to-tr from-teal-200/15 via-cyan-300/10 to-sky-300/15 shadow-inner border border-white/40 backdrop-blur-[2px]"
          />

          {/* Connection status badges */}
          <motion.div 
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute left-[195px] top-[105px] bg-cyan-50/80 border border-cyan-100/50 rounded-full px-2.5 py-0.5 flex items-center space-x-1 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[8.5px] font-bold text-cyan-600 uppercase tracking-widest">Online</span>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute left-[45px] top-[170px] bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm text-[12px]"
          >
            💬
          </motion.div>
        </div>

        {/* Bottom Quote section */}
        <div className="z-10 mt-auto max-w-sm select-none">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2 leading-tight">
            Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500">
              conversations are waiting.
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Reconnect instantly through beautifully designed realtime communication.
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE: Centered Frosted Light Card (Stacked on mobile) ================= */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 md:p-12 relative min-h-screen overflow-y-auto bg-transparent">

        {/* Form Container Wrapper */}
        <div className="relative w-full max-w-[390px] z-10 flex flex-col space-y-4">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="login-form-card"
                initial={{ opacity: 0, y: 35, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -25, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="frosted-light-card w-full rounded-[32px] px-6 py-8 md:p-8 flex flex-col items-center justify-between"
              >
                {/* Header (visible on mobile only) */}
                <div className="w-full flex flex-col items-center mb-6 text-center select-none lg:hidden">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-teal-400 flex items-center justify-center shadow-md mb-2.5">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-1">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500">
                      Bloop
                    </span>
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Welcome back.
                  </p>
                </div>

                {/* Form Title (visible on desktop) */}
                <div className="w-full text-center hidden lg:block select-none mb-6">
                  <h2 className="text-xl font-extrabold text-slate-800">Welcome back</h2>
                  <p className="text-xs text-slate-400 mt-1">Provide your credentials to access chats.</p>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
                  
                  {/* Email or Username */}
                  <div className="flex flex-col">
                    <div className={inputContainerClasses}>
                      <input
                        type="text"
                        name="emailOrUsername"
                        value={formData.emailOrUsername}
                        onChange={handleChange}
                        onFocus={() => handleFocus('emailOrUsername')}
                        onBlur={handleInputBlur}
                        className="light-input w-full pl-11 pr-4 pt-5 pb-1.5 rounded-xl text-[14px] placeholder-transparent outline-none"
                      />
                      <label
                        className={`${labelClasses} ${
                          formData.emailOrUsername || focused.emailOrUsername 
                            ? 'top-1.5 text-[9.5px] text-cyan-500 font-semibold' 
                            : 'top-3.5 text-slate-400'
                        }`}
                      >
                        Email or Username
                      </label>
                      <User className={`${iconClasses} top-3.5 ${
                        formData.emailOrUsername || focused.emailOrUsername ? 'text-cyan-500' : 'text-slate-400'
                      }`} />
                    </div>
                    <AnimatePresence>
                      {touched.emailOrUsername && errors.emailOrUsername && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center text-[11px] text-rose-500 pl-1 mt-1 overflow-hidden"
                        >
                          <AlertCircle className={errorIconClasses} />
                          <span>{errors.emailOrUsername}</span>
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
                            ? 'top-1.5 text-[9.5px] text-cyan-500 font-semibold' 
                            : 'top-3.5 text-slate-400'
                        }`}
                      >
                        Password
                      </label>
                      <Lock className={`${iconClasses} top-3.5 ${
                        formData.password || focused.password ? 'text-cyan-500' : 'text-slate-400'
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

                  {/* Controls: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-1 select-none">
                    <label className="flex items-center space-x-2.5 cursor-pointer group text-slate-500 hover:text-slate-700 transition-colors">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleCheckboxChange}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded border border-slate-200 bg-white/40 flex items-center justify-center peer-checked:bg-gradient-to-r peer-checked:from-cyan-400 peer-checked:to-teal-400 peer-checked:border-teal-400 transition-all duration-200">
                        <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium">Remember me</span>
                    </label>

                    <a 
                      href="#forgot-password" 
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset instructions sent (simulated).');
                      }}
                      className="text-[12px] text-cyan-600 hover:text-cyan-700 transition-colors font-medium hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="cyan-gradient-btn w-full text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 text-[14px] cursor-pointer mt-3 select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-1.5">
                        <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="relative w-full flex items-center justify-center my-5 select-none">
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

                {/* Social Logins */}
                <div className="flex flex-col space-y-2 w-full">
                  <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(0,0,0,0.02)' }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
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
                    onClick={() => handleSocialLogin('GitHub')}
                    className="light-input w-full flex items-center justify-center space-x-2.5 py-2.5 rounded-xl cursor-pointer select-none text-[13px] text-slate-600 font-medium transition-all"
                  >
                    <Github className="w-4 h-4 text-slate-800" />
                    <span>Continue with GitHub</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              // Success Screen
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="frosted-light-card w-full rounded-3xl p-8 md:p-10 flex flex-col items-center text-center justify-center min-h-[380px]"
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
                  Welcome back!
                </h2>
                
                <div className="text-slate-500 max-w-sm text-[14px] mb-7 leading-relaxed">
                  <p>
                    You have successfully signed in as <strong className="text-slate-800">{formData.fullName || formData.emailOrUsername}</strong>.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Loading workspace chats and history lists...
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate('/chat')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 text-[14px] cursor-pointer"
                >
                  <span>Go to Application</span>
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
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-600 hover:text-cyan-700 font-bold transition-colors hover:underline">
                Register
              </Link>
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
