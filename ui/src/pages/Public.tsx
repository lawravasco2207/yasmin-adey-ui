import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getPublicContent, getLinks } from '../services/api';
import '../styles/public.scss'; // Assuming a style file

interface BrandLink {
  name: string;
  url: string;
}

interface Content {
  id: number;
  title: string;
  type: 'video' | 'image' | 'slideshow';
  status: 'published';
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

  return (
    <motion.div
      className="public-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1>Public Goodies</h1>
      <section className="content-list">
        <ul>
          {contentList.map((item) => {
            const filePath = typeof item.file_path === 'string' && item.file_path.startsWith('[')
              ? JSON.parse(item.file_path) // Parse if JSON string
              : [item.file_path]; // Wrap string in array

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {item.type === 'image' && (
                  <LazyLoadImage
                    src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api'}/uploads${filePath[0]}`}
                    alt={item.title}
                    effect="blur"
                    className="thumbnail"
                  />
                )}
                {item.type === 'video' && (
                  <video
                    src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api'}/uploads${filePath[0]}`}
                    className="thumbnail"
                    controls
                    preload="metadata"
                  />
                )}
                {item.type === 'slideshow' && (
                  <div className="thumbnail-slideshow">
                    {filePath.map((path: string, index: number) => (
                      <LazyLoadImage
                        key={index}
                        src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api'}/uploads${path}`}
                        alt={`${item.title} slide ${index + 1}`}
                        effect="blur"
                        className="thumbnail-slide"
                      />
                    ))}
                  </div>
                )}
                <div className="content-details">
                  <span className="title">{item.title}</span> - {item.type}
                  {item.caption && <p className="caption">{renderCaption(item.caption)}</p>}
                  {item.brand_links && item.brand_links.length > 0 && (
                    <div className="brand-links">
                      {item.brand_links.map((link, index) => (
                        <p key={index}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </section>
      <section className="links-list">
        <h2>Public Links</h2>
        <ul>
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
            </li>
          ))}
        </ul>
      </section>
    </motion.div>
  );
};

export default Public;