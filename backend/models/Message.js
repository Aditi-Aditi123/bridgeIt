import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'pdf', 'audio', 'file'],
    default: 'text'
  },
  content: {
    type: String,  // text message content OR cloudinary file URL
    required: true
  },
  fileName: {
    type: String   // original file name for display
  },
  fileSize: {
    type: String   // e.g. "2.4 MB"
  },
  publicId: {
    type: String   // cloudinary public_id (needed to delete files)
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;