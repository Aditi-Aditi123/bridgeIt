import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import api from '../utils/api';
import '../App.css';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await api.get('/sections');
      setSections(res.data);
      // Auto-select first section if exists
      if (res.data.length > 0) setActiveSection(res.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectSection = (sec) => {
    setActiveSection(sec);
    setShowSidebar(false); // on mobile: hide sidebar when chat opens
  };

  const handleSectionCreated = (sec) => {
    setSections(prev => [...prev, sec]);
    setActiveSection(sec);
    setShowSidebar(false);
  };

  return (
    <div className="dashboard">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="mobile-back-btn" onClick={() => setShowSidebar(true)}>
          ☰
        </button>
        <span className="mobile-logo">bridge<em>It</em></span>
      </div>

      <div className="dashboard-body">
        {/* Sidebar — hidden on mobile when chat is open */}
        <div className={`sidebar-wrapper ${showSidebar ? 'show' : 'hide'}`}>
          <Sidebar
            sections={sections}
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            onSectionCreated={handleSectionCreated}
            onLogout={handleLogout}
          />
        </div>

        {/* Chat area — hidden on mobile when sidebar is shown */}
        <div className={`chat-wrapper ${!showSidebar ? 'show' : 'hide'}`}>
          <ChatArea section={activeSection} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;