// src/routes/dashboard.ts
import express from 'express';
import { getTodos, addTodo } from '../controllers/dashboardController';

const router = express.Router();

router.get('/todos', getTodos);
router.post('/todos', addTodo);

export default router;