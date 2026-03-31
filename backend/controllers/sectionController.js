import Section from '../models/Section.js';
import Message from '../models/Message.js';

export const getSections = async (req, res) => {
  try {
    let sections = await Section.find({ user: req.user._id })
      .sort({ pinned: -1, createdAt: 1 });

    if (sections.length === 0) {
      const general = await Section.create({
        name: 'General',
        user: req.user._id
      });
      sections = [general];
    }

    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Section name required' });
    const section = await Section.create({ name, user: req.user._id });
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    await Message.deleteMany({ section: req.params.id });
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section and all its messages deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const pinSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    section.pinned = !section.pinned;
    await section.save();
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};