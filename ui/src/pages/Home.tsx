// src/pages/Home.tsx
import React from 'react';
import { motion } from 'framer-motion';
import '../styles/home.scss';

const Home: React.FC = () => {
  return (
    <motion.div
      className="futuristic-bg home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <video
        className="background-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/images/Snaptik.app_7427402104106503429.mp4" type="video/mp4" />
        Your browser doesn’t support video.
      </video>

      <motion.div
        className="content-container"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1, type: 'spring' }}
      >
        <motion.h1
          className="neon-title"
          initial={{ scale: 0.8, rotateX: -90 }}
          animate={{ scale: 1, rotateX: 0 }}
          transition={{ delay: 0.3, duration: 1, type: 'spring' }}
        >
          Meet Yasmin
        </motion.h1>

        <motion.section className="overview">
          <p>
            A micro influencer and content creator.
          </p>
          <br />
          <br />
          <br />
          <br />
          <div className="public-links">
            <motion.a
              href="/public"
              className="link-btn"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5, type: 'spring' }}
              whileHover={{ scale: 1.1, rotateX: 10 }}
            >
              
              Public Gallery
            </motion.a>
            <motion.a
              href="/contact"
              className="link-btn"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5, type: 'spring' }}
              whileHover={{ scale: 1.1, rotateX: 10 }}
            >
              Contact
            </motion.a>
          </div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
};

export default Home;