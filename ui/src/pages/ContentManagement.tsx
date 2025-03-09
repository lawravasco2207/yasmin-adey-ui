import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getContent, uploadContent, deleteContent, addLink, getLinks, deleteLink } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaTrash, FaLink } from 'react-icons/fa';
import '../styles/contentManagement.scss';

interface BrandLink {
  name: string;
  url: string;
}

interface Content {
  id: number;
  title: string;
  type: 'video' | 'image' | 'slideshow';
  status: 'draft' | 'published'; // Updated type
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

const ContentManagement: React.FC = () => {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft'); // New state
  const [brandLinks, setBrandLinks] = useState<BrandLink[]>([{ name: '', url: '' }]);
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const contentResponse = await getContent(headers);
        console.log('Fetched content on mount:', contentResponse.data.data);
        setContentList(contentResponse.data.data);

        const linksResponse = await getLinks(headers);
        console.log('Fetched links on mount:', linksResponse.data.data);
        setLinks(linksResponse.data.data);
      } catch (error: any) {
        console.error('Failed to fetch data on mount:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
        setContentList([]);
        setLinks([]);
      }
    };
    fetchData();
  }, [navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
    setFilePreview(files.length > 0 ? URL.createObjectURL(files[0]) : null);
  };

  const handleBrandLinkChange = (index: number, field: 'name' | 'url', value: string) => {
    const updatedLinks = [...brandLinks];
    updatedLinks[index][field] = value;
    setBrandLinks(updatedLinks);
  };

  const addBrandLink = () => setBrandLinks([...brandLinks, { name: '', url: '' }]);
  const removeBrandLink = (index: number) => setBrandLinks(brandLinks.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Pick some files first, bro!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
  
      console.log('Starting upload for files:', selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file)); // Must match 'files'
      formData.append('caption', caption);
      formData.append('status', status);
      const validBrandLinks = brandLinks.filter(link => link.name && link.url);
      if (validBrandLinks.length > 0) {
        formData.append('brand_links', JSON.stringify(validBrandLinks));
      }
  
      // Log FormData contents
      for (const pair of formData.entries()) {
        console.log(`FormData entry: ${pair[0]} =`, pair[1]);
      }
  
      await uploadContent(formData, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Upload successful');
      const refreshedResponse = await getContent({ Authorization: `Bearer ${token}` });
      console.log('Refreshed content after upload:', refreshedResponse.data.data);
      setContentList(refreshedResponse.data.data);
      setSelectedFiles([]);
      setFilePreview(null);
      setCaption('');
      setStatus('published');
      setBrandLinks([{ name: '', url: '' }]);
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
    } catch (error: any) {
      console.error('Upload failed:', {
        message: error.message,
        response: error.response?.data || 'No response data',
        status: error.response?.status,
      });
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      } else if (error.response?.status === 400) {
        alert('Upload failed: Bad request—check files, bro!');
      } else {
        alert('Upload failed, bro! Try again.');
      }
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name || !newLink.url) {
      alert('Please enter a name and URL, darling!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await addLink(newLink.name, newLink.url, { Authorization: `Bearer ${token}` });
      console.log('Link added:', response.data.data);
      setLinks([...links, response.data.data]);
      setNewLink({ name: '', url: '' });
    } catch (error: any) {
      console.error('Failed to add link:', error);
      alert('Failed to add link, bro!');
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (window.confirm('Sure you want to delete this link, sweetie?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        console.log(`Attempting to delete link ID: ${id}`);
        const response = await deleteLink(id, { Authorization: `Bearer ${token}` });
        console.log('Delete response:', response.data);
        setLinks(links.filter(link => link.id !== id));
      } catch (error: any) {
        console.error('Delete link failed:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      }
    }
  };

  const handleDeleteContent = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this, sweetie?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        console.log(`Attempting to delete content ID: ${id}`);
        const response = await deleteContent(id, { Authorization: `Bearer ${token}` });
        console.log('Delete response:', response.data);
        setContentList(prevList => prevList.filter(item => item.id !== id));
      } catch (error: any) {
        console.error('Delete failed:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      }
    }
  };

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
    <motion.div className="futuristic-bg content-management" initial={{ opacity: 0, scale: 0.8, rotateX: -90 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ duration: 1.2, type: 'spring', bounce: 0.4 }}>
      <motion.section className="upload-section" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}>
        <h2><FaUpload /> Drop Your Magic Here</h2>
        <input id="file-input" type="file" accept="image/*,video/*" multiple onChange={handleFileChange} />
        <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (e.g., **bold**, *italic*, [Brand](https://...))" />
        <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <div className="brand-links-section">
          <h3><FaLink /> Brand Links</h3>
          {brandLinks.map((link, index) => (
            <div key={index} className="brand-link-input">
              <input type="text" value={link.name} onChange={(e) => handleBrandLinkChange(index, 'name', e.target.value)} placeholder="Brand Name" />
              <input type="text" value={link.url} onChange={(e) => handleBrandLinkChange(index, 'url', e.target.value)} placeholder="URL (e.g., https://brand.com)" />
              <motion.button onClick={() => removeBrandLink(index)} whileHover={{ scale: 1.1 }} className="remove-link-btn">
                <FaTrash />
              </motion.button>
            </div>
          ))}
          <motion.button onClick={addBrandLink} whileHover={{ scale: 1.1 }} className="add-link-btn">
            Add Link
          </motion.button>
        </div>
        {filePreview && selectedFiles.length > 0 && (
          <motion.div className="file-preview" initial={{ scale: 0, rotateY: 180, opacity: 0 }} animate={{ scale: 1, rotateY: 0, opacity: 1 }} transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}>
            {selectedFiles[0].type.startsWith('image') && (
              <LazyLoadImage src={filePreview} alt="Preview" effect="blur" className="preview-media" />
            )}
            {selectedFiles[0].type.startsWith('video') && (
              <video controls src={filePreview} className="preview-media" />
            )}
            {selectedFiles.length > 1 && <p>Slideshow: {selectedFiles.length} images selected</p>}
          </motion.div>
        )}
        <motion.button onClick={handleUpload} disabled={selectedFiles.length === 0} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} whileHover={{ scale: 1.1, rotateX: 10 }}>
          Upload
        </motion.button>
      </motion.section>

      <motion.section className="links-section" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}>
        <h2><FaLink /> Add Public Links</h2>
        <input type="text" value={newLink.name} onChange={(e) => setNewLink({ ...newLink, name: e.target.value })} placeholder="Link Name (e.g., Shop my outfit at Amazon)" />
        <input type="text" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="URL (e.g., https://amazon.com)" />
        <motion.button onClick={handleAddLink} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} whileHover={{ scale: 1.1, rotateX: 10 }}>
          Add Link
        </motion.button>
        <ul>
          {links.map((link) => (
            <motion.li key={link.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
              <motion.button onClick={() => handleDeleteLink(link.id)} whileHover={{ scale: 1.1 }} className="delete-btn">
                <FaTrash />
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <motion.section className="content-list" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}>
  <h2>Your Glittering Collection</h2>
  <ul>
    {contentList.map((item) => {
      let filePath: string[] = [];
      try {
        filePath = typeof item.file_path === 'string' && item.file_path.startsWith('[')
          ? JSON.parse(item.file_path)
          : Array.isArray(item.file_path)
          ? item.file_path
          : [item.file_path];
      } catch (error) {
        console.error(`Failed to parse file_path for item ${item.id}:`, item.file_path, error);
        filePath = []; // Fallback
      }
      const cleanFilePath = filePath[0] && typeof filePath[0] === 'string'
        ? filePath[0].replace(/^\/uploads\//, '')
        : ''; // Empty if invalid
      return (
        <motion.li key={item.id} initial={{ opacity: 0, y: 50, rotateZ: -10 }} whileInView={{ opacity: 1, y: 0, rotateZ: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, type: 'spring' }}>
          {item.type === 'image' && cleanFilePath && (
            <LazyLoadImage
              src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api'}/uploads/${cleanFilePath}`}
              alt={item.title}
              effect="blur"
              className="thumbnail"
            />
          )}
          {item.type === 'video' && cleanFilePath && (
            <video
              src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api'}/uploads/${cleanFilePath}`}
              className="thumbnail"
              preload="metadata"
              controls
            />
          )}
          {item.type === 'slideshow' && filePath.length > 0 && (
            <div className="thumbnail-slideshow">
              {filePath.map((path: string, index: number) => {
                const cleanPath = typeof path === 'string' ? path.replace(/^\/uploads\//, '') : '';
                return cleanPath ? (
                  <LazyLoadImage
                    key={index}
                    src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api'}/uploads/${cleanPath}`}
                    alt={`${item.title} slide ${index + 1}`}
                    effect="blur"
                    className="thumbnail-slide"
                  />
                ) : null;
              })}
            </div>
          )}
          <div className="content-details">
            <span className="title">{item.title}</span> - {item.type} - <span className={item.status}>{item.status}</span>
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
            {cleanFilePath && (
              <a
                href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api'}/uploads/${cleanFilePath}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Peek
              </a>
            )}
          </div>
          <motion.button className="delete-btn" onClick={() => handleDeleteContent(item.id)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }} whileHover={{ scale: 1.1, rotateX: 10 }}>
            <FaTrash />
          </motion.button>
        </motion.li>
      );
    })}
  </ul>
</motion.section>
    </motion.div>
  );
};

export default ContentManagement;