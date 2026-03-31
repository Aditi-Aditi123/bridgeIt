import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    const isAudio = file.mimetype.startsWith('audio/');
    const isImage = file.mimetype.startsWith('image/');

    return {
      folder: 'bridgeit',
      resource_type: isImage ? 'image' : 'raw',
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
      // For PDFs and audio — make them publicly accessible
      access_mode: 'public',
      type: 'upload'
    };
  }
});

export const upload = multer({ storage });
export default cloudinary;