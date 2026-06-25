import multer from 'multer';

// Use memory storage — no local folder needed
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});