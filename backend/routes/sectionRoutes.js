import express from 'express';
import { getSections, createSection, deleteSection } from '../controllers/sectionController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSections);
router.post('/', protect, createSection);
router.delete('/:id', protect, deleteSection);

export default router;