import express from 'express';
import { translateText } from '../controllers/translateController.js';

const router = express.Router();

// POST /api/translate
router.post('/', translateText);

// POST /api/translate/batch - handled by same controller logic
router.post('/batch', translateText);

export default router;
