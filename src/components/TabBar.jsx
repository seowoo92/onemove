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
      {TABS.map(({ key, label }) => (
        <div
          key={key}
          onClick={() => onTabChange(key)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: activeTab === key ? 600 : 400,
            color: activeTab === key ? '#24523F' : '#9AA39C',
            cursor: 'pointer',
          }}
        >
          {label}
        </div>
      ))}
    </div>
  )
}
