// src/pages/Public.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getPublicContent, getLinks } from '../services/api';
import '../styles/public.scss';

interface BrandLink {
  name: string;
  url: string;
}

interface Content {
  id: number;
  title: string;
  type: 'video' | 'image' | 'slideshow';
  status: 'draft' | 'in_review' | 'published';
  file_path: string;
  caption: string | null;
  brand_links: BrandLink[] | null;
}

interface Link {
  id: number;
  name: string;
  url: string;
  created_at: string;
}

const Public: React.FC = () => {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contentResponse = await getPublicContent();
        console.log('Fetched public content:', contentResponse.data.data);
        setContentList(contentResponse.data.data);

        const linksResponse = await getLinks();
        console.log('Fetched public links:', linksResponse.data.data);
        setLinks(linksResponse.data.data);
      } catch (error: any) {
        console.error('Failed to fetch public data:', error);
        setContentList([]);
        setLinks([]);
      }
    };
    fetchData();
  }, []);

  const renderCaption = (caption: string | null) => {
    if (!caption) return null;
    const parts = caption.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      } else if (part.match(/\[.*?\]\(.*?\)/)) {
        const [, text, url] = part.match(/\[(.+?)\]\((.+?)\)/) || [];
        return <a key={index} href={url} target="_blank" rel="noopener noreferrer">{text}</a>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50; // Pixels to trigger swipe
    if (info.offset.y < -swipeThreshold && currentIndex < contentList.length - 1) {
      setCurrentIndex((prev) => prev + 1); // Swipe up
    } else if (info.offset.y > swipeThreshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1); // Swipe down
    }
  };

  const currentContent = contentList[currentIndex];

  useEffect(() => {
    if (videoRef.current && currentContent?.type === 'video') {
      videoRef.current.load(); // Reload video when index changes
      videoRef.current.play().catch((err) => console.log('Autoplay failed:', err));
    }
  }, [currentIndex, currentContent]);

  return (
    <motion.div
      className="futuristic-bg public-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <motion.h1
        className="neon-title"
        initial={{ scale: 0.8, rotateX: -90 }}
        animate={{ scale: 1, rotateX: 0 }}
        transition={{ delay: 0.3, duration: 1, type: 'spring' }}
      >
        Yasmin’s TikTok Vibes
      </motion.h1>

      <motion.div
        className="neon-line"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      />

      <motion.section
        className="video-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1, type: 'spring' }}
      >
        {contentList.length === 0 ? (
          <motion.p>No vibes yet, fam! Yasmin’s cooking something up—check back soon.</motion.p>
        ) : (
          <motion.div
            className="video-frame"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            dragElastic={0.2}
            dragMomentum={false}
          >
            {currentContent.type === 'image' && (
              <LazyLoadImage
                src={`http://localhost:5000${JSON.parse(currentContent.file_path)[0]}`}
                alt={currentContent.title}
                effect="blur"
                className="tiktok-media"
              />
            )}
            {currentContent.type === 'video' && (
              <video
                ref={videoRef}
                src={`http://localhost:5000${JSON.parse(currentContent.file_path)[0]}`}
                className="tiktok-media"
                autoPlay
                loop
                muted={false}
                playsInline
              />
            )}
            {currentContent.type === 'slideshow' && (
              <div className="slideshow">
                {JSON.parse(currentContent.file_path).map((path: string, index: number) => (
                  <LazyLoadImage
                    key={index}
                    src={`http://localhost:5000${path}`}
                    alt={`${currentContent.title} slide ${index + 1}`}
                    effect="blur"
                    className="tiktok-media slideshow-image"
                  />
                ))}
              </div>
            )}
            <motion.div className="video-overlay">
              <p className="caption">{renderCaption(currentContent.caption) || currentContent.title}</p>
              {currentContent.brand_links && currentContent.brand_links.length > 0 && (
                <div className="brand-links">
                  {currentContent.brand_links.map((link, index) => (
                    <p key={index}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.section>

      <motion.section
        className="extra-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6, type: 'spring' }}
      >
        {links.length > 0 && (
          <div className="public-links">
            <h2>Explore More</h2>
            {links.map((link) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.1, rotateX: 10 }}
              >
                {link.name}
              </motion.a>
            ))}
          </div>
        )}
        {/* Add more content here later—bio, collabs, etc. */}
      </motion.section>
    </motion.div>
  );
};

export default Public;