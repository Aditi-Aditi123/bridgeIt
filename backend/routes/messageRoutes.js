import express from 'express';
import { getMessages, sendTextMessage, uploadFile, deleteMessage } from '../controllers/messageController.js';
import protect from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.get('/:sectionId', protect, getMessages);
router.post('/text', protect, sendTextMessage);
router.post('/upload', protect, upload.single('file'), uploadFile);
router.delete('/:id', protect, deleteMessage);

export default router;