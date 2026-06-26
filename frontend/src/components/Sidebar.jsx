import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

const Sidebar = ({
  sections, activeSection, onSelectSection, onSectionCreated,
  onSectionDeleted, onSectionPinned, onLogout, user, theme,
  onToggleTheme, onOpenSettings, mobileShowAddInput, onMobileAddInputDone
}) => {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const colors = ['#1D9E75', '#185FA5', '#854F0B', '#A32D2D', '#533AB7', '#0F6E56'];

  // When mobile + button is clicked, auto open the input
  useEffect(() => {
    if (mobileShowAddInput) {
      setShowInput(true);
    }
  }, [mobileShowAddInput]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/sections', { name: newName.trim() });
      onSectionCreated(res.data);
      setNewName('');
      setShowInput(false);
      if (onMobileAddInputDone) onMobileAddInputDone();
    } catch (err) {
      alert('Could not create section');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setNewName('');
    setShowInput(false);
    if (onMobileAddInputDone) onMobileAddInputDone();
  };

  const handleDeleteSection = async (e, sectionId) => {
    e.stopPropagation();
    setOpenDropdown(null);
    if (!window.confirm('Delete this section and all its messages?')) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      onSectionDeleted(sectionId);
    } catch (err) {
      alert('Could not delete section');
    }
  };

  const handlePinSection = async (e, sectionId) => {
    e.stopPropagation();
    setOpenDropdown(null);
    try {
      const res = await api.patch(`/sections/${sectionId}/pin`);
      onSectionPinned(res.data);
    } catch (err) {
      alert('Could not pin section');
    }
  };

  const handleSettingsClick = () => {
    setShowProfile(false);
    onOpenSettings();
  };

  const toggleDropdown = (e, sectionId) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === sectionId ? null : sectionId);
  };

  return (
    <div className="sidebar">

      {/* Logo — hidden on mobile (topbar handles it) */}
      <div className="sidebar-logo desktop-only">
        <span className="logo-text">bridge<em>It</em></span>
        <button className="theme-toggle-btn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Sections header — hidden on mobile (topbar handles + button) */}
      <div className="sidebar-header desktop-only">
        <span className="sidebar-label">SECTIONS</span>
        <button className="add-btn" onClick={() => setShowInput(!showInput)}>+</button>
      </div>

      {/* New section input */}
      {showInput && (
        <div className="new-section-input">
          <input
            placeholder="Section name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
            style={{ flex: 1, minWidth: 0 }}
          />
          <button className="input-confirm-btn" onClick={handleCreate} disabled={loading} title="Create">
            {loading ? '...' : '✓'}
          </button>
          <button className="input-cancel-btn" onClick={handleCancel} title="Cancel">
            ✕
          </button>
        </div>
      )}

      {/* Section list */}
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
              <span className="section-name">
                {sec.pinned && <span className="pin-icon">📌</span>}
                {sec.name}
              </span>
            </div>

            <div className="section-menu-wrapper" ref={openDropdown === sec._id ? dropdownRef : null}>
              <button
                className="section-menu-btn"
                onClick={(e) => toggleDropdown(e, sec._id)}
                title="Options"
              >⋮</button>

              {openDropdown === sec._id && (
                <div className="section-dropdown">
                  <button className="section-dropdown-item" onClick={(e) => handlePinSection(e, sec._id)}>
                    {sec.pinned ? '📌 Unpin section' : '📌 Pin section'}
                  </button>
                  <button className="section-dropdown-item danger" onClick={(e) => handleDeleteSection(e, sec._id)}>
                    🗑 Delete section
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Profile at bottom */}
      <div className="sidebar-profile" onClick={() => setShowProfile(!showProfile)}>
        <div className="profile-avatar">
          {user?.name?.slice(0, 2).toUpperCase() || 'ME'}
        </div>
        <div className="profile-info">
          <span className="profile-name">{user?.name || 'User'}</span>
          <span className="profile-email">{user?.email || ''}</span>
        </div>
        <span className="profile-chevron">{showProfile ? '▾' : '▴'}</span>
      </div>

      {showProfile && (
        <div className="profile-popup">
          <div className="profile-popup-header">
            <div className="profile-popup-avatar">
              {user?.name?.slice(0, 2).toUpperCase() || 'ME'}
            </div>
            <div>
              <div className="profile-popup-name">{user?.name}</div>
              <div className="profile-popup-email">{user?.email}</div>
            </div>
          </div>
          <div className="profile-popup-divider" />
          <button className="profile-popup-option" onClick={handleSettingsClick}>
            ⚙️ Settings
          </button>
          <button className="profile-popup-logout" onClick={onLogout}>
            ⎋ Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;