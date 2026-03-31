import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads folder if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, unique);
  }
});

export const upload = multer({ storage });