import Message from '../models/Message.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ section: req.params.sectionId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendTextMessage = async (req, res) => {
  try {
    const { content, sectionId } = req.body;
    if (!content) return res.status(400).json({ message: 'Message cannot be empty' });

    const message = await Message.create({
      section: sectionId,
      user: req.user._id,
      type: 'text',
      content
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    console.log('File:', req.file);
    console.log('Body:', req.body);

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const sectionId = req.body.sectionId || req.query.sectionId;
    if (!sectionId) return res.status(400).json({ message: 'sectionId is required' });

    const mime = req.file.mimetype;
    let type = 'file';
    if (mime.startsWith('image/')) type = 'image';
    else if (mime === 'application/pdf') type = 'pdf';
    else if (mime.startsWith('audio/')) type = 'audio';
    else if (mime.startsWith('video/')) type = 'video';

    const bytes = req.file.size;
    const fileSize = bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    let fileUrl = '';
    let publicId = '';

    if (mime.startsWith('image/')) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bridgeit',
        resource_type: 'image'
      });
      fileUrl = result.secure_url;
      publicId = result.public_id;
      fs.unlinkSync(req.file.path);

    } else if (mime.startsWith('video/')) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bridgeit',
        resource_type: 'video'
      });
      fileUrl = result.secure_url;
      publicId = result.public_id;
      fs.unlinkSync(req.file.path);

    } else {
      // PDFs and Audio — upload to Cloudinary as raw
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bridgeit',
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true
      });
      fileUrl = result.secure_url;
      publicId = result.public_id;
      fs.unlinkSync(req.file.path);
    }

    const message = await Message.create({
      section: sectionId,
      user: req.user._id,
      type,
      content: fileUrl,
      fileName: req.file.originalname,
      fileSize,
      publicId
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (message.publicId) {
      try {
        const resourceType = message.type === 'video'
          ? 'video'
          : message.type === 'pdf' || message.type === 'audio'
            ? 'raw'
            : 'image';
        await cloudinary.uploader.destroy(message.publicId, { resource_type: resourceType });
      } catch (e) {
        console.error('Cloudinary delete error:', e.message);
      }
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};