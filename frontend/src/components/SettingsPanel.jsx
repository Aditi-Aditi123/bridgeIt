const FONTS = [
  { label: 'System Default', value: "'Segoe UI', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Georgia', value: "'Georgia', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
];

const BUBBLE_COLORS = [
  { label: 'Default',        dark: '#252525', light: '#ffffff' },
  { label: 'Green',          dark: '#0d2b1e', light: '#e6f5ee' },
  { label: 'Blue',           dark: '#0d1b2b', light: '#e6f0fb' },
  { label: 'Purple',         dark: '#1e0d2b', light: '#f0e6fb' },
  { label: 'Warm',           dark: '#2b1e0d', light: '#fdf3e6' },
  { label: 'Dark Green',     dark: '#0A3323', light: '#0A3323' },
  { label: 'Moss Green',     dark: '#839958', light: '#839958' },
  { label: 'Beige',          dark: '#F7F4D5', light: '#F7F4D5' },
  { label: 'Rosy Brown',     dark: '#D396BC', light: '#D396BC' },
  { label: 'Midnight Green', dark: '#105666', light: '#105666' },
];

const BG_COLORS = [
  { label: 'Default',        dark: '#0f0f0f', light: '#f5f5f5' },
  { label: 'Navy',           dark: '#060d1a', light: '#eaf0fb' },
  { label: 'Forest',         dark: '#060f09', light: '#eafaf0' },
  { label: 'Warm Grey',      dark: '#141210', light: '#faf8f5' },
  { label: 'Pure Black',     dark: '#000000', light: '#eeeeee' },
  { label: 'Dark Green',     dark: '#0A3323', light: '#0A3323' },
  { label: 'Moss Green',     dark: '#839958', light: '#839958' },
  { label: 'Beige',          dark: '#F7F4D5', light: '#F7F4D5' },
  { label: 'Rosy Brown',     dark: '#D396BC', light: '#D396BC' },
  { label: 'Midnight Green', dark: '#105666', light: '#105666' },
];

const SIDEBAR_COLORS = [
  { label: 'Default',        dark: '#1a1a1a', light: '#ffffff' },
  { label: 'Charcoal',       dark: '#111111', light: '#f0f0f0' },
  { label: 'Navy',           dark: '#060d1a', light: '#dceeff' },
  { label: 'Forest',         dark: '#060f09', light: '#dcf5e4' },
  { label: 'Dark Green',     dark: '#0A3323', light: '#0A3323' },
  { label: 'Moss Green',     dark: '#839958', light: '#839958' },
  { label: 'Beige',          dark: '#F7F4D5', light: '#F7F4D5' },
  { label: 'Rosy Brown',     dark: '#D396BC', light: '#D396BC' },
  { label: 'Midnight Green', dark: '#105666', light: '#105666' },
];

const INPUTBAR_COLORS = [
  { label: 'Default',        dark: '#1a1a1a', light: '#ffffff' },
  { label: 'Darker',         dark: '#111111', light: '#f0f0f0' },
  { label: 'Navy',           dark: '#060d1a', light: '#dceeff' },
  { label: 'Forest',         dark: '#060f09', light: '#dcf5e4' },
  { label: 'Dark Green',     dark: '#0A3323', light: '#0A3323' },
  { label: 'Moss Green',     dark: '#839958', light: '#839958' },
  { label: 'Beige',          dark: '#F7F4D5', light: '#F7F4D5' },
  { label: 'Rosy Brown',     dark: '#D396BC', light: '#D396BC' },
  { label: 'Midnight Green', dark: '#105666', light: '#105666' },
];

const ColorRow = ({ colors, theme, value, onChange }) => (
  <div className="settings-color-row">
    {colors.map(c => {
      const val = theme === 'dark' ? c.dark : c.light;
      return (
        <button
          key={c.label}
          className={`settings-color-btn ${value === val ? 'active' : ''}`}
          style={{ background: val, border: '2px solid var(--border)' }}
          onClick={() => onChange(val)}
          title={c.label}
        />
      );
    })}
  </div>
);

const SettingsPanel = ({ onClose, settings, onSettingsChange, theme }) => {
  const handleChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    onSettingsChange(updated);
    localStorage.setItem('bridgeit-settings', JSON.stringify(updated));
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        {/* Font Size */}
        <div className="settings-section">
          <div className="settings-section-label">Font Size</div>
          <div className="settings-font-size-row">
            {['small', 'medium', 'large'].map(size => (
              <button
                key={size}
                className={`settings-size-btn ${settings.fontSize === size ? 'active' : ''}`}
                onClick={() => handleChange('fontSize', size)}
              >
                {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
                <span>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="settings-section">
          <div className="settings-section-label">Font Style</div>
          <div className="settings-font-list">
            {FONTS.map(f => (
              <button
                key={f.value}
                className={`settings-font-btn ${settings.fontFamily === f.value ? 'active' : ''}`}
                style={{ fontFamily: f.value }}
                onClick={() => handleChange('fontFamily', f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Bubble Color */}
        <div className="settings-section">
          <div className="settings-section-label">Message Bubble Color</div>
          <ColorRow colors={BUBBLE_COLORS} theme={theme} value={settings.bubbleColor} onChange={v => handleChange('bubbleColor', v)} />
        </div>

        {/* Chat Background */}
        <div className="settings-section">
          <div className="settings-section-label">Chat Background</div>
          <ColorRow colors={BG_COLORS} theme={theme} value={settings.chatBg} onChange={v => handleChange('chatBg', v)} />
        </div>

        {/* Sidebar Color */}
        <div className="settings-section">
          <div className="settings-section-label">Left Panel Color</div>
          <ColorRow colors={SIDEBAR_COLORS} theme={theme} value={settings.sidebarBg} onChange={v => handleChange('sidebarBg', v)} />
        </div>

        {/* Input Bar Color */}
        <div className="settings-section">
          <div className="settings-section-label">Type Box &amp; Task Bar Color</div>
          <ColorRow colors={INPUTBAR_COLORS} theme={theme} value={settings.inputbarBg} onChange={v => handleChange('inputbarBg', v)} />
        </div>

        {/* Reset */}
        <button
          className="settings-reset-btn"
          onClick={() => {
            const defaults = {
              fontSize: 'medium',
              fontFamily: "'Segoe UI', sans-serif",
              bubbleColor: '', chatBg: '', sidebarBg: '', inputbarBg: ''
            };
            onSettingsChange(defaults);
            localStorage.setItem('bridgeit-settings', JSON.stringify(defaults));
          }}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;