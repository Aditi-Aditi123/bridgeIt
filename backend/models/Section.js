import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Section = mongoose.model('Section', sectionSchema);
export default Section;