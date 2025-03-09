// src/routes/dashboard.ts
import express from 'express';
import dashboardController from '../controllers/dashboardController'; // Import default

const router = express.Router();

router.get('/todos', dashboardController.getTodos); // Array with checkSession
router.post('/todos', dashboardController.addTodo); // Array with checkSession

export default router;