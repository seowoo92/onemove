const ICONS = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.8L12 4l8 6.8" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5V14h4v5.5" />
    </svg>
  ),
  record: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2.6" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h3.5" />
    </svg>
  ),
  settings: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h11" />
      <path d="M19 8h1" />
      <circle cx="16" cy="8" r="2.3" fill="#FFFFFF" />
      <path d="M4 16h5" />
      <path d="M13 16h7" />
      <circle cx="10" cy="16" r="2.3" fill="#FFFFFF" />
    </svg>
  ),
}

const TABS = [
  { key: 'home', label: '홈' },
  { key: 'record', label: '기록' },
  { key: 'settings', label: '설정' },
]

export default function TabBar({ activeTab, onTabChange, style }) {
  return (
    <div
      style={{
        display: 'flex',
        height: '56px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #ECE6DC',
        ...style,
      }}
    >
      {TABS.map(({ key, label }) => {
        const active = activeTab === key
        return (
          <div
            key={key}
            onClick={() => onTabChange(key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              color: active ? '#24523F' : '#9AA39C',
              cursor: 'pointer',
            }}
          >
            {ICONS[key]}
            <span style={{ fontSize: '11.5px', fontWeight: active ? 800 : 500 }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
