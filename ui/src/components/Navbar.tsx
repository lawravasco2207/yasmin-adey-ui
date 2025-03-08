// src/components/Navbar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/navbar.scss';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  let clickCount = 0;

  const handleLogoClick = () => navigate('/');

  const handleProfileClick = () => {
    clickCount++;
    if (clickCount === 2) {
      navigate('/login');
      clickCount = 0;
    }
    setTimeout(() => (clickCount = 0), 500);
  };

  return (
    <motion.nav
      className="ybh"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: 'spring' }}
    >
      <div className="profile">
        <h4>Yasmineey's Space</h4>
        <motion.img
          src="/images/Yaslogo.jpg"// Adjust path if needed
          alt="yas profile"
          onClick={handleLogoClick}
          whileHover={{ scale: 1.1, rotate: 10 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="display-image">
        <motion.img
          src="/images/yasProfile.jpg" // Adjust path if needed
          alt="display"
          className="display-img"
          onClick={handleProfileClick}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: 'spring', bounce: 0.3 }}
          whileHover={{ scale: 1.1 }}
        />
      </div>
      <div className="star" style={{ top: '10%', left: '10%' }}></div>
      <div className="star" style={{ top: '20%', left: '80%' }}></div>
      <div className="star" style={{ top: '70%', left: '50%' }}></div>
      <div className="star" style={{ top: '80%', left: '20%' }}></div>
      <div className="star" style={{ top: '50%', left: '90%' }}></div>
    </motion.nav>
  );
};

export default Navbar;