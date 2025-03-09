import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { getPublicContent } from '../services/api'; // Adjust this import based on your API setup
import '../styles/public.scss';

interface Content {
  id: number;
  title: string;
  type: 'video' | 'image' | 'slideshow';
  status: 'draft' | 'published';
  file_path: string;
  caption: string | null;
  brand_links: { name: string; url: string }[] | null;
}

const Public: React.FC = () => {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const bio = {
    name: "Yasmin",
    tagline: "Vibes only, bro ✌️",
    description: "Just a creator living that TikTok life—catch my vids!",
  };

  // Fetch public content on mount
  useEffect(() => {
    const fetchPublicContent = async () => {
      try {
        const response = await getPublicContent();
        setContentList(response.data.data.filter((item: Content) => item.status === 'published'));
      } catch (error: any) {
        console.error('Failed to fetch public content:', error.message);
        setContentList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicContent();
  }, []);

  // Handle navigation with wheel and keyboard
  useEffect(() => {
    const handleNavigation = (event: WheelEvent | KeyboardEvent) => {
      if (selectedIndex === null || contentList.length === 0 || isScrolling) return;

      setIsScrolling(true);
      let newDirection = 0;
      if (event instanceof WheelEvent) {
        newDirection = event.deltaY > 0 ? 1 : -1;
      } else if (event instanceof KeyboardEvent) {
        if (event.key === 'ArrowDown') newDirection = 1;
        if (event.key === 'ArrowUp') newDirection = -1;
      }

      const newIndex = selectedIndex + newDirection;
      if (newIndex >= 0 && newIndex < contentList.length) {
        setDirection(newDirection);
        setSelectedIndex(newIndex);
      }

      setTimeout(() => setIsScrolling(false), 300); // Debounce to prevent rapid updates
    };

    window.addEventListener('wheel', handleNavigation);
    window.addEventListener('keydown', handleNavigation);
    return () => {
      window.removeEventListener('wheel', handleNavigation);
      window.removeEventListener('keydown', handleNavigation);
    };
  }, [selectedIndex, contentList.length, isScrolling]);

  // Handle arrow button clicks
  const handleArrowClick = (move: 'up' | 'down') => {
    if (selectedIndex === null || isScrolling) return;
    setIsScrolling(true);

    const newIndex = move === 'down' ? selectedIndex + 1 : selectedIndex - 1;
    if (newIndex >= 0 && newIndex < contentList.length) {
      setDirection(move === 'down' ? 1 : -1);
      setSelectedIndex(newIndex);
    }

    setTimeout(() => setIsScrolling(false), 300);
  };

  // Parse file paths safely
  const parseFilePath = (filePathData: string | string[]) => {
    let filePath: string[] = [];
    try {
      filePath = typeof filePathData === 'string' && filePathData.startsWith('[')
        ? JSON.parse(filePathData)
        : Array.isArray(filePathData)
        ? filePathData
        : [filePathData];
    } catch (error) {
      console.error('Failed to parse file_path:', error);
      filePath = [];
    }
    return filePath[0]?.replace(/^\/uploads\//, '') || '';
  };

  if (loading) {
    return (
      <motion.div
        className="public-page loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Loading the vibes, bro...</h2>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="futuristic-bg public-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, type: 'spring', bounce: 0.4 }}
    >
      {/* Bio Section */}
      <motion.header
        className="bio-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1>{bio.name}</h1>
        <p className="tagline">{bio.tagline}</p>
        <p className="description">{bio.description}</p>
      </motion.header>

      {/* Video Grid */}
      <section className="video-grid">
        {contentList.length === 0 ? (
          <p>No public vids yet, bro!</p>
        ) : (
          contentList.map((item, index) => (
            <motion.div
              key={item.id}
              className="video-tile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 20, 147, 0.5)' }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedIndex(index)}
            >
              {item.type === 'video' && (
                <video
                  src={`${import.meta.env.VITE_BACKEND_URL || 'https://yas-is-so-fab-1.onrender.com/api'}/uploads/${parseFilePath(item.file_path)}`}
                  className="thumbnail"
                  muted
                  preload="metadata"
                  poster={`${import.meta.env.VITE_BACKEND_URL || 'https://yas-is-so-fab-1.onrender.com/api'}/uploads/${parseFilePath(item.file_path)}#t=0.1`}
                />
              )}
              <div className="tile-overlay">
                {item.caption && <p className="caption">{item.caption}</p>}
              </div>
            </motion.div>
          ))
        )}
      </section>

      {/* Video Overlay */}
      <AnimatePresence>
        {selectedIndex !== null && contentList[selectedIndex] && (
          <motion.div
            className="video-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.target === e.currentTarget && setSelectedIndex(null)}
          >
            <motion.div
              className="video-player"
              initial={{ y: direction > 0 ? '100vh' : '-100vh', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction > 0 ? '-100vh' : '100vh', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              key={contentList[selectedIndex].id}
            >
              {contentList[selectedIndex].type === 'video' && (
                <video
                  src={`${import.meta.env.VITE_BACKEND_URL || 'https://yas-is-so-fab-1.onrender.com/api'}/uploads/${parseFilePath(contentList[selectedIndex].file_path)}`}
                  className="full-video"
                  controls
                  autoPlay
                  preload="auto"
                />
              )}
              <motion.div
                className="video-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {contentList[selectedIndex].caption && (
                  <p className="caption">{contentList[selectedIndex].caption}</p>
                )}
                {contentList[selectedIndex].brand_links?.map((link, index) => (
                  <p key={index}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.name}
                    </a>
                  </p>
                ))}
              </motion.div>
              <motion.button
                className="arrow-btn arrow-up"
                onClick={() => handleArrowClick('up')}
                disabled={selectedIndex === 0}
                whileHover={{ scale: 1.1 }}
              >
                <FaArrowUp />
              </motion.button>
              <motion.button
                className="arrow-btn arrow-down"
                onClick={() => handleArrowClick('down')}
                disabled={selectedIndex === contentList.length - 1}
                whileHover={{ scale: 1.1 }}
              >
                <FaArrowDown />
              </motion.button>
              <button className="close-btn" onClick={() => setSelectedIndex(null)}>
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Public;