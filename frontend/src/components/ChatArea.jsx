import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const ChatArea = ({ section, settings }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (section) fetchMessages();
  }, [section]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

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
      alert('Upload failed — video must be under 100MB');
    }
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (err) {
      alert('Could not delete message');
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported. Please use Chrome!');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setText(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const getFileIcon = (type) => {
    if (type === 'pdf') return '📄';
    if (type === 'image') return '🖼️';
    if (type === 'audio') return '🎵';
    if (type === 'video') return '🎬';
    return '📎';
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Font size map
  const fontSizeMap = { small: '12px', medium: '14px', large: '16px' };
  const fontSize = fontSizeMap[settings?.fontSize] || '14px';
  const fontFamily = settings?.fontFamily || "'Segoe UI', sans-serif";
  const bubbleColor = settings?.bubbleColor || 'var(--bubble)';
  const chatBg = settings?.chatBg || 'var(--bg)';

  if (!section) return (
    <div className="chat-empty">
      <div className="empty-icon">🌉</div>
      <h2>Welcome to BridgeIt</h2>
      <p>Select a section or create a new one to start transferring files</p>
    </div>
  );

  return (
    <div className="chat-area" style={{ fontFamily, background: chatBg }}>
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
              <div className="msg-bubble" style={{ background: bubbleColor, fontSize }}>
                <span>{msg.content}</span>
                <button className="msg-delete-btn" onClick={() => handleDeleteMessage(msg._id)} title="Delete">✕</button>
              </div>
            ) : msg.type === 'image' ? (
              <div className="image-card">
                <img src={msg.content} alt={msg.fileName} className="msg-image" />
                <div className="image-card-footer">
                  <span className="file-size" style={{ fontSize }}>{msg.fileSize}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a href={msg.content} download={msg.fileName} target="_blank" rel="noreferrer" className="download-btn">↓</a>
                    <button className="msg-delete-btn-card" onClick={() => handleDeleteMessage(msg._id)}>✕</button>
                  </div>
                </div>
              </div>
            ) : msg.type === 'video' ? (
              <div className="video-card">
                <video controls className="msg-video">
                  <source src={msg.content} />
                </video>
                <div className="image-card-footer">
                  <span className="file-name" style={{ fontSize }}>{msg.fileName}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a href={msg.content} download={msg.fileName} target="_blank" rel="noreferrer" className="download-btn">↓</a>
                    <button className="msg-delete-btn-card" onClick={() => handleDeleteMessage(msg._id)}>✕</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="file-card" style={{ background: bubbleColor }}>
                <span className="file-icon">{getFileIcon(msg.type)}</span>
                <div className="file-info">
                  <span className="file-name" style={{ fontSize }}>{msg.fileName}</span>
                  <span className="file-size">{msg.fileSize}</span>
                </div>
                <a href={msg.content} target="_blank" rel="noreferrer" className="download-btn">↓</a>
                <button className="msg-delete-btn-card" onClick={() => handleDeleteMessage(msg._id)}>✕</button>
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
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.zip"
        />
        <textarea
          ref={textareaRef}
          className="text-input"
          placeholder={listening ? '🎤 Listening...' : 'Type a message...'}
          value={text}
          rows={1}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendText();
            }
          }}
          style={{ fontSize, fontFamily, resize: 'none', overflow: 'hidden' }}
        />
        <button
          className={`voice-btn ${listening ? 'listening' : ''}`}
          onClick={listening ? stopListening : startListening}
          title="Voice to text"
        >
          🎤
        </button>
        <button className="send-btn" onClick={sendText}>➤</button>
      </div>
    </div>
  );
};

export default ChatArea;