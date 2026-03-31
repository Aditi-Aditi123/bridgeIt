import { useState } from 'react';
import api from '../utils/api';

const Sidebar = ({ sections, activeSection, onSelectSection, onSectionCreated, onLogout }) => {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/sections', { name: newName.trim() });
      onSectionCreated(res.data);
      setNewName('');
      setShowInput(false);
    } catch (err) {
      alert('Could not create section');
    }
    setLoading(false);
  };

  const colors = ['#1D9E75', '#185FA5', '#854F0B', '#A32D2D', '#533AB7'];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">bridge<em>It</em></span>
        <button className="logout-btn" onClick={onLogout} title="Logout">⎋</button>
      </div>

      <div className="sidebar-header">
        <span className="sidebar-label">SECTIONS</span>
        <button className="add-btn" onClick={() => setShowInput(!showInput)}>+</button>
      </div>

      {showInput && (
        <div className="new-section-input">
          <input
            placeholder="Section name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <button onClick={handleCreate} disabled={loading}>
            {loading ? '...' : '✓'}
          </button>
        </div>
      )}

      <div className="section-list">
        {sections.map((sec, i) => (
          <div
            key={sec._id}
            className={`section-item ${activeSection?._id === sec._id ? 'active' : ''}`}
            onClick={() => onSelectSection(sec)}
          >
            <div className="section-avatar" style={{ background: colors[i % colors.length] }}>
              {sec.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="section-info">
              <span className="section-name">{sec.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;