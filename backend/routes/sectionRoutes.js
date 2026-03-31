import express from 'express';
import { getSections, createSection, deleteSection, pinSection } from '../controllers/sectionController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSections);
router.post('/', protect, createSection);
router.delete('/:id', protect, deleteSection);
router.patch('/:id/pin', protect, pinSection);

export default router;