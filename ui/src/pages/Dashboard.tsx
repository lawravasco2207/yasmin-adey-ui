// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence for exit animations
import Calendar from 'react-calendar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import 'react-calendar/dist/Calendar.css';
import { getTodos, addTodo, getChatMessages, submitChatReply } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEnvelope, FaCalendarAlt, FaChartLine, FaCog, FaMinus, FaPlus as FaExpand } from 'react-icons/fa'; // Added FaMinus, FaExpand
import '../styles/dashboard.scss';
import { Value } from 'react-calendar/src/shared/types.js';

interface Todo {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string;
}

interface ChatMessage {
  id: number;
  sender_name: string;
  sender_email: string;
  vision: string | null;
  website_url: string | null;
  image_path: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  replied?: boolean; // Track if replied
}

const mockAnalytics = [
  { month: 'Jan', revenue: 1200, expenses: 800 },
  { month: 'Feb', revenue: 1500, expenses: 900 },
  { month: 'Mar', revenue: 1800, expenses: 1000 },
];

const Dashboard: React.FC = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: '', priority: 'medium' as const, dueDate: '' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newReply, setNewReply] = useState('');
  const [minimizedMessages, setMinimizedMessages] = useState<Set<number>>(new Set()); // Track minimized messages
  const navigate = useNavigate();

  const fetchData = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      console.log('No session ID, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const todosResponse = await getTodos();
      console.log('Fetched todos:', todosResponse.data.data);
      setTodos(todosResponse.data.data);

      const messagesResponse = await getChatMessages();
      console.log('Fetched messages:', messagesResponse.data.data);
      setMessages(messagesResponse.data.data.map((msg: ChatMessage) => ({ ...msg, replied: false })));

      const unread = messagesResponse.data.data.filter((msg: ChatMessage) => !msg.is_read);
      if (unread.length > 0 && Notification.permission === 'granted') {
        new Notification(`You have ${unread.length} new message${unread.length > 1 ? 's' : ''}!`, {
          body: 'Check your dashboard, darling!',
          icon: '/favicon.ico',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 401) {
        localStorage.removeItem('sessionId');
        navigate('/login', { replace: true });
      }
    }
  };

  useEffect(() => {
    fetchData();
    if (Notification.permission !== 'granted') Notification.requestPermission();
    const interval = setInterval(() => {
      console.log('Checking reminders');
      checkReminders();
    }, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleDateChange = (value: Value) => {
    if (Array.isArray(value)) {
      setDate(value[0] || null);
    } else {
      setDate(value || null);
    }
  };

  const handleTodoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewTodo({ ...newTodo, [e.target.name]: e.target.value });
  };

  const handleAddTodo = async () => {
    if (!newTodo.title || !newTodo.dueDate) {
      alert('Please enter a title and due date, darling!');
      return;
    }
    try {
      const response = await addTodo(newTodo.title, newTodo.priority, newTodo.dueDate);
      console.log('Added todo:', response.data.data);
      setTodos([...todos, response.data.data]);
      setNewTodo({ title: '', priority: 'medium', dueDate: '' });
    } catch (error: any) {
      console.error('Failed to add todo:', {
        message: error.message,
        response: error.response?.data,
      });
    }
  };

  const handleReply = async (messageId: number) => {
    if (!newReply) {
      alert('Please write a reply, sweetie!');
      return;
    }
    try {
      const response = await submitChatReply(messageId, newReply);
      console.log('Reply response:', response.data);
      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, replied: true } : msg
      ));
      setNewReply('');
      setTimeout(() => {
        setMessages(messages.filter(msg => msg.id !== messageId)); // Remove after 1s
      }, 1000);
    } catch (error: any) {
      console.error('Failed to submit reply:', {
        message: error.message,
        response: error.response?.data,
      });
    }
  };

  const toggleMinimize = (messageId: number) => {
    setMinimizedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) newSet.delete(messageId);
      else newSet.add(messageId);
      return newSet;
    });
  };

  const checkReminders = () => {
    const now = new Date();
    todos.forEach((todo) => {
      const dueDate = new Date(todo.due_date);
      const timeDiff = dueDate.getTime() - now.getTime();
      const minutesUntilDue = timeDiff / (1000 * 60);
      if (minutesUntilDue > 0 && minutesUntilDue <= 15 && Notification.permission === 'granted') {
        new Notification(`Reminder: "${todo.title}" is due soon!`, {
          body: `Due: ${dueDate.toLocaleString()}`,
          icon: '/favicon.ico',
        });
      }
    });
  };

  return (
    <motion.div
      className="futuristic-bg dashboard"
      initial={{ opacity: 0, rotateX: -90 }}
      animate={{ opacity: 1, rotateX: 0 }}
      transition={{ duration: 1, type: 'spring' }}
    >
      <motion.section
        className="add-todo"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
      >
        <h2><FaPlus /> Add a Sparkly To-Do</h2>
        <input
          type="text"
          name="title"
          value={newTodo.title}
          onChange={handleTodoChange}
          placeholder="What’s on your mind, sweetie?"
        />
        <select name="priority" value={newTodo.priority} onChange={handleTodoChange}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input type="datetime-local" name="dueDate" value={newTodo.dueDate} onChange={handleTodoChange} />
        <motion.button
          onClick={handleAddTodo}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.1, rotateX: 10 }}
        >
          Add
        </motion.button>
      </motion.section>

      <motion.section
        className="tasks"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
      >
        <h2>Your To-Dos</h2>
        <ul>
          {todos.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, scale: 0.8, rotateZ: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotateZ: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {task.title} - <span className={task.priority}>{task.priority}</span> - Due: {new Date(task.due_date).toLocaleString()}
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        className="notifications"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}
      >
        <h2><FaEnvelope /> Your Messages</h2>
        <div className="message-list">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`message ${msg.is_read ? 'read' : 'unread'} ${minimizedMessages.has(msg.id) ? 'minimized' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.5 } }} // Fade out on reply
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <div className="message-header">
                  <h3>{msg.sender_name}</h3>
                  <motion.button
                    className="minimize-btn"
                    onClick={() => toggleMinimize(msg.id)}
                    whileHover={{ scale: 1.1 }}
                  >
                    {minimizedMessages.has(msg.id) ? <FaExpand /> : <FaMinus />}
                  </motion.button>
                </div>
                {!minimizedMessages.has(msg.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p><strong>Email:</strong> {msg.sender_email}</p>
                    {msg.vision && <p><strong>Vision:</strong> {msg.vision}</p>}
                    {msg.website_url && (
                      <p><strong>Website:</strong> <a href={msg.website_url} target="_blank" rel="noopener noreferrer">{msg.website_url}</a></p>
                    )}
                    {msg.image_path && <img src={`http://localhost:5000${msg.image_path}`} alt="Brand" className="brand-image" />}
                    <p><strong>Message:</strong> {msg.message}</p>
                    {!msg.replied && (
                      <>
                        <textarea
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder="Type your reply, darling..."
                          rows={3}
                        />
                        <motion.button
                          onClick={() => handleReply(msg.id)}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, type: 'spring' }}
                          whileHover={{ scale: 1.1, rotateX: 10 }}
                        >
                          Reply
                        </motion.button>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      <motion.section
        className="calendar"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6, type: 'spring' }}
      >
        <h2><FaCalendarAlt /> Your Glam Schedule</h2>
        <motion.div
          initial={{ scale: 0.8, rotateY: 90 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileClassName={({ date }) =>
              todos.some((task) => new Date(task.due_date).toDateString() === date.toDateString()) ? 'highlight' : ''
            }
          />
        </motion.div>
        <p>Selected: {date ? date.toDateString() : 'None'}</p>
      </motion.section>

      <motion.section
        className="analytics"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6, type: 'spring' }}
      >
        <h2><FaChartLine /> Your Sparkly Finances</h2>
        <LineChart width={500} height={300} data={mockAnalytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.5} />
          <XAxis dataKey="month" stroke="#ffffff" />
          <YAxis stroke="#ffffff" />
          <Tooltip contentStyle={{ background: '#1e1e2f', border: '2px solid #ff00cc' }} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#ff00cc" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="expenses" stroke="#00ffcc" />
        </LineChart>
      </motion.section>

      <motion.section
        className="quick-links"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, type: 'spring' }}
      >
        <h2><FaCog /> Quick Links</h2>
        <motion.a
          href="/content"
          className="link-btn"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.1, rotateX: 10 }}
        >
          Manage Content
        </motion.a>
      </motion.section>
    </motion.div>
  );
};

export default Dashboard;