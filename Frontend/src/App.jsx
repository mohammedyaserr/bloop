import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Auth/Register';
import Login from './Auth/Login';
import ChatingHome from './Chating screen/Chating-home';
import ProfilePage from './Profile/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatingHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Redirect any other path to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

