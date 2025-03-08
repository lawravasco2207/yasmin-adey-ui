// src/routes/link.ts
import express from 'express';
import { addLink, getLinks, deleteLink } from '../controllers/linkController';

const linkRouter = express.Router();

linkRouter.post('/add', addLink);
linkRouter.get('/', getLinks);
linkRouter.delete('/:id', deleteLink);

export default linkRouter;