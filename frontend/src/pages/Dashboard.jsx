import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import SettingsPanel from '../components/SettingsPanel';
import api from '../utils/api';
import '../App.css';

const MIN_SIDEBAR = 180;
const MAX_SIDEBAR = 400;
const DEFAULT_SIDEBAR = 240;

const defaultSettings = {
  fontSize: 'medium',
  fontFamily: "'Segoe UI', sans-serif",
  bubbleColor: '',
  chatBg: ''
};

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bridgeit-settings')) || defaultSettings;
    } catch { return defaultSettings; }
  });

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_SIDEBAR);

  useEffect(() => { fetchSections(); }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchSections = async () => {
    try {
      const res = await api.get('/sections');
      setSections(res.data);
      if (res.data.length > 0) setActiveSection(res.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const diff = e.clientX - startX.current;
      const newWidth = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, startWidth.current + diff));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSelectSection = (sec) => {
    setActiveSection(sec);
    setShowSidebar(false);
  };

  const handleSectionCreated = (sec) => {
    setSections(prev => [...prev, sec]);
    setActiveSection(sec);
    setShowSidebar(false);
  };

  const handleSectionDeleted = (id) => {
    setSections(prev => prev.filter(s => s._id !== id));
    if (activeSection?._id === id) setActiveSection(null);
  };

  const handleSectionPinned = (updatedSection) => {
    setSections(prev => {
      const updated = prev.map(s => s._id === updatedSection._id ? updatedSection : s);
      // Sort: pinned first, then by createdAt
      return updated.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    });
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="dashboard">
      <div className="mobile-topbar">
        <button className="mobile-back-btn" onClick={() => setShowSidebar(true)}>☰</button>
        <span className="mobile-logo">bridge<em>It</em></span>
      </div>

      <div className="dashboard-body">
        <div
          className={`sidebar-wrapper ${showSidebar ? 'show' : 'hide'}`}
          style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
        >
          <Sidebar
            sections={sections}
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            onSectionCreated={handleSectionCreated}
            onSectionDeleted={handleSectionDeleted}
            onSectionPinned={handleSectionPinned}
            onLogout={handleLogout}
            user={user}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => setShowSettings(true)}
          />
          <div className="sidebar-drag-handle" onMouseDown={handleDragStart} title="Drag to resize" />
        </div>

        <div className={`chat-wrapper ${!showSidebar ? 'show' : 'hide'}`}>
          <ChatArea section={activeSection} settings={settings} />
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={setSettings}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Dashboard;