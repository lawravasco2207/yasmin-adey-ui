// src/pages/Contact.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitChatMessage } from '../services/api';
import '../styles/contact.scss';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    sender_name: '', // Your brand name
    sender_email: '', // Your email
    vision: '', // Brand vision
    website_url: '', // Brand website
    message: '', // Message to Yasmin
    image: null as File | null, // Optional brand image
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Sending message to Yasmin:', formData);
      const response = await submitChatMessage(
        formData.sender_name,
        formData.sender_email,
        formData.vision,
        formData.website_url,
        formData.message, // Sent as plaintext; server encrypts
        formData.image || undefined
      );
      console.log('Message sent successfully:', response.data);
      setSubmitted(true);
      setFormData({ sender_name: '', sender_email: '', vision: '', website_url: '', message: '', image: null });
    } catch (error: any) {
      console.error('Failed to send message:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert('Oops! Something broke, bro. Try again.');
    }
  };

  return (
    <motion.div
      className="futuristic-bg chat-page"
      initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 1.2, type: 'spring', bounce: 0.4 }}
    >
      <motion.h1
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
      >
        Talk to Yasmin!
      </motion.h1>

      <motion.section
        className="chat-form"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
      >
        {submitted ? (
          <motion.p
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            Message sent, bro! Yasmin’s got it and will hit you back soon.
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit}>
            <motion.input
              type="text"
              name="sender_name"
              value={formData.sender_name}
              onChange={handleChange}
              placeholder="Your brand name"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            />
            <motion.input
              type="email"
              name="sender_email"
              value={formData.sender_email}
              onChange={handleChange}
              placeholder="Your email, man"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            />
            <motion.textarea
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              placeholder="What’s your brand’s vibe?"
              rows={3}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />
            <motion.input
              type="url"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="Your site (if you got one)"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            />
            <motion.input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              placeholder="Drop a brand pic (optional)"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            />
            <motion.textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="What you wanna say to Yasmin?"
              rows={5}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            />
            <motion.button
              type="submit"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6, type: 'spring' }}
              whileHover={{ scale: 1.1, rotateX: 10 }}
            >
              Send It to Yasmin
            </motion.button>
          </form>
        )}
      </motion.section>
    </motion.div>
  );
};

export default Contact;