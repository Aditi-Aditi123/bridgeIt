import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const ChatArea = ({ section }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (section) fetchMessages();
  }, [section]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${section._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendText = async () => {
    if (!text.trim()) return;
    try {
      const res = await api.post('/messages/text', {
        content: text.trim(),
        sectionId: section._id
      });
      setMessages(prev => [...prev, res.data]);
      setText('');
    } catch (err) {
      alert('Could not send message');
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(
        `/messages/upload?sectionId=${section._id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const getFileIcon = (type) => {
    if (type === 'pdf') return '📄';
    if (type === 'image') return '🖼️';
    if (type === 'audio') return '🎵';
    return '📎';
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!section) return (
    <div className="chat-empty">
      <div className="empty-icon">🌉</div>
      <h2>Welcome to BridgeIt</h2>
      <p>Select a section or create a new one to start transferring files</p>
    </div>
  );

  return (
    <div className="chat-area">
      <div className="chat-topbar">
        <div className="chat-topbar-avatar">
          {section.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="chat-topbar-name">{section.name}</div>
          <div className="chat-topbar-hint">Your personal section</div>
        </div>
      </div>

      <div className="messages-list">
        {messages.length === 0 && (
          <div className="no-messages">No messages yet. Send something!</div>
        )}
        {messages.map(msg => (
          <div key={msg._id} className="message-item">
            {msg.type === 'text' ? (
              <div className="msg-bubble">{msg.content}</div>
            ) : (
              <div className="file-card">
                <span className="file-icon">{getFileIcon(msg.type)}</span>
                <div className="file-info">
                  <span className="file-name">{msg.fileName}</span>
                  <span className="file-size">{msg.fileSize}</span>
                </div>
                {msg.type === 'pdf' || msg.type === 'audio' ? (
                  <a
                    href={msg.content}
                    target="_blank"
                    rel="noreferrer"
                    className="download-btn"
                    title="Download"
                  >
                    ↓
                  </a>
                ) : (
                  <a
                    href={msg.content}
                    download={msg.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="download-btn"
                    title="Download"
                  >
                    ↓
                  </a>
                )}
              </div>
            )}
            <span className="msg-time">{formatTime(msg.createdAt)}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <button
          className="attach-btn"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          title="Attach file"
        >
          {uploading ? '⏳' : '📎'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
        />
        <input
          className="text-input"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendText()}
        />
        <button className="send-btn" onClick={sendText}>➤</button>
      </div>
    </div>
  );
};

export default ChatArea;