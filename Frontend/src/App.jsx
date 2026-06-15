import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Auth/Register';
import Login from './Auth/Login';
import ChatingHome from './Chating screen/Chating-home';
import ProfilePage from './Profile/ProfilePage';
import DownloadPage from './Download page/Download-page';
import CallDemo from './Calling/CallDemo';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isIPadOS = (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /Macintosh/.test(ua));
      const isSmallScreen = window.innerWidth < 1024;

      setIsMobile(isMobileUA || isIPadOS || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const isCallPath = window.location.pathname === '/call';

  if (isMobile && !isCallPath) {
    return <DownloadPage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatingHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/call" element={<CallDemo />} />
        {/* Redirect any other path to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

