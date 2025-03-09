// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Collaboration from './pages/Collaboration';
import ContentManagement from './pages/ContentManagement';
import Financials from './pages/Financials';
import Public from './pages/Public';
import Navbar from './components/Navbar';
import api  from './services/api';
import './styles/main.scss';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/content']; // Keep your protected routes
    const token = localStorage.getItem('token'); // Switch to 'token'
    const isLoginPage = location.pathname === '/login';

    // Redirect if no token and on a protected route
    if (protectedRoutes.includes(location.pathname) && !token && !isLoginPage) {
      console.log('No token, redirecting to login from:', location.pathname);
      navigate('/login', { replace: true });
      return;
    }

    // Validate token for protected routes
    if (token && protectedRoutes.includes(location.pathname) && !isLoginPage) {
      api.get<void>('/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error: { message: string }) => {
        console.log('Session invalid, redirecting to login:', error.message);
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="app">
      <Navbar />
      <br />
      <br />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/financials" element={<Financials />} />
        <Route path="/public" element={<Public />} />
      </Routes>
    </div>
  );
};

export default App;