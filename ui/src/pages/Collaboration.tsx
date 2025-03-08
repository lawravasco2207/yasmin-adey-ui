// src/pages/Collaboration.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTodos, addTodo } from '../services/api'; // Use exported functions
import { useNavigate } from 'react-router-dom';
import '../styles/collaboration.scss'; // Assuming a matching SCSS file

interface Todo {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string;
}

const Collaboration: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: '', priority: 'medium' as const, dueDate: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodos = async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        console.log('No session ID, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        const response = await getTodos();
        console.log('Fetched todos:', response.data.data);
        setTodos(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch todos:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        navigate('/login');
      }
    };
    fetchTodos();
  }, [navigate]);

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
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  return (
    <motion.div
      className="futuristic-bg collaboration"
      initial={{ opacity: 0, rotateX: -90 }}
      animate={{ opacity: 1, rotateX: 0 }}
      transition={{ duration: 1, type: 'spring' }}
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        Collaborate, Darling!
      </motion.h1>

      <motion.section
        className="todo-section"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
      >
        <h2>Add a Collaboration Task</h2>
        <input
          type="text"
          name="title"
          value={newTodo.title}
          onChange={handleTodoChange}
          placeholder="What’s the task, sweetie?"
        />
        <select name="priority" value={newTodo.priority} onChange={handleTodoChange}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input
          type="datetime-local"
          name="dueDate"
          value={newTodo.dueDate}
          onChange={handleTodoChange}
        />
        <motion.button
          onClick={handleAddTodo}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.1, rotateX: 10 }}
        >
          Add Task
        </motion.button>
      </motion.section>

      <motion.section
        className="todo-list"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}
      >
        <h2>Your Tasks</h2>
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
    </motion.div>
  );
};

export default Collaboration;