const TABS = [
  { label: '홈', active: true },
  { label: '기록', active: false },
  { label: '설정', active: false },
]

export default function TabBar({ style }) {
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
      {TABS.map(({ label, active }) => (
        <div
          key={label}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: active ? 600 : 400,
            color: active ? '#24523F' : '#9AA39C',
            cursor: 'default',
          }}
        >
          {label}
        </div>
      ))}
    </div>
  )
}
