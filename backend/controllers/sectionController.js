import Section from '../models/Section.js';

// Get all sections for logged in user
export const getSections = async (req, res) => {
  try {
    let sections = await Section.find({ user: req.user._id }).sort({ createdAt: 1 });

    // Auto-create General section if user has none
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

// Create a new section
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

// Delete a section
export const deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};