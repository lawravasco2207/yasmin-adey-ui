import React, { useState, useEffect } from 'react';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newInput = input + e.key.toLowerCase();
      if (newInput.length > 3) {
        setInput(newInput.slice(-3)); // Keep last 3 chars
      } else {
        setInput(newInput);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  useEffect(() => {
    if (input === 'yas') {
      handleLogin();
    }
  }, [input]);

  const handleLogin = async () => {
    try {
      const response = await login({ input });
      localStorage.setItem('token', response.data.token);
      console.log('Logged in with "yas"');
      navigate('/dashboard'); // Or wherever
    } catch (error) {
      console.error('Login failed:', error);
      setInput(''); // Reset on fail
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        background: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        cursor: 'none',
      }}
    >
      {input.length > 0 && input !== 'yas' ? 'Keep typing...' : 'Type anywhere'}
    </div>
  );
};

export default Login;