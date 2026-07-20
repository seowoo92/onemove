import '../screens/garden.css'

// 정원 장면 (4:3) — 정원 탭 본 화면과 앨범 열람이 공용으로 사용.
// count 기준으로 열린 요소만 배치하고, garden.css의 상시 애니메이션이 그대로 적용된다.
export default function GardenScene({ elements, bg, count, newIds, hiddenIds, ariaLabel, emptyHint, style }) {
  const unlocked = elements.filter((el) => count >= el.threshold && !hiddenIds?.has(el.id))
  const newList = newIds ? [...newIds] : []
  return (
    <div
      className="garden-scene"
      role="img"
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        aspectRatio: '4 / 3',
        overflow: 'hidden',
        background: '#CDE6F2',
        ...style,
      }}
    >
      <img
        src={`/onemove/images/${bg}`}
        alt=""
        draggable="false"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {unlocked.map((el) => (
        <div
          key={el.id}
          className={`garden-item garden-item--${el.id}${el.wide ? ' garden-item--wide' : ''}${newIds?.has(el.id) ? ' garden-item--new' : ''}`}
          data-motion={el.motion}
          aria-hidden="true"
          style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, zIndex: el.z }}
        >
          {el.shadow !== 'none' && <span className={`garden-shadow garden-shadow--${el.shadow}`} />}
          <span
            className="garden-body"
            style={newIds?.has(el.id) ? { animationDelay: `${newList.indexOf(el.id) * 0.22}s` } : undefined}
          >
            <img src={`/onemove/images/${el.file}`} alt="" draggable="false" decoding="async" />
          </span>
        </div>
      ))}
      {unlocked.length === 0 && emptyHint && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '42%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,.85)',
            borderRadius: 999,
            padding: '9px 16px',
            fontSize: 12.5,
            fontWeight: 600,
            color: '#3A4A40',
            whiteSpace: 'nowrap',
          }}
        >
          {emptyHint}
        </div>
      )}
    </div>
  )
}
