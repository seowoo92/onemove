import { useEffect, useState } from 'react'
import { storage } from '../lib/storage'
import { getSeason, countSeasonCompleted, GARDEN_ELEMENTS, getUnlockedElements, getNextElement } from '../lib/garden'
import './garden.css'

const CARD_SHADOW = '0 8px 18px -14px rgba(36,82,63,.2)'

export default function GardenScreen() {
  const history = storage.getHistory()
  const season = getSeason(storage.getTodayKey())
  // ?garden=숫자 미리보기 (개발 확인·발표 데모용) — 기록·seen 저장에는 영향 없음
  const previewCount = Number(new URLSearchParams(window.location.search).get('garden'))
  const isPreview = Number.isFinite(previewCount) && previewCount > 0
  const count = isPreview ? previewCount : countSeasonCompleted(history, season)
  const unlocked = getUnlockedElements(count)
  const next = getNextElement(count)

  // 마지막으로 본 완료 수 이후 새로 열린 요소만 등장 연출 (1초 뒤 상시 움직임으로 전환)
  const [newIds, setNewIds] = useState(() => {
    const seen = isPreview ? 0 : storage.getGardenSeen()
    return new Set(GARDEN_ELEMENTS.filter((el) => el.threshold > seen && count >= el.threshold).map((el) => el.id))
  })
  useEffect(() => {
    if (!isPreview) storage.setGardenSeen(count)
    if (newIds.size === 0) return
    const t = setTimeout(() => setNewIds(new Set()), 1000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#FAF6F0' }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', padding: '8px 20px 96px' }}>
        <h2 style={{ fontSize: 23, fontWeight: 800, color: '#24523F', margin: '0 0 2px' }}>정원</h2>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '0 0 16px' }}>
          {season.year} {season.name} · 루틴을 완료하면 정원이 자라나요
        </p>

        {/* 여름 정원 장면 — 요소들이 상시로 살아 움직임 */}
        <div
          className="garden-scene"
          role="img"
          aria-label={`나의 ${season.name} 정원 — 요소 ${unlocked.length}개`}
          style={{
            position: 'relative',
            aspectRatio: '4 / 3',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: CARD_SHADOW,
            background: '#CDE6F2',
          }}
        >
          <img
            src="/onemove/images/garden-summer-bg.jpg"
            alt=""
            draggable="false"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {unlocked.map((el) => (
            <div
              key={el.id}
              className={`garden-item garden-item--${el.id}${el.wide ? ' garden-item--wide' : ''}${newIds.has(el.id) ? ' garden-item--new' : ''}`}
              data-motion={el.motion}
              aria-hidden="true"
              style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, zIndex: el.z }}
            >
              {el.shadow !== 'none' && <span className={`garden-shadow garden-shadow--${el.shadow}`} />}
              <span className="garden-body">
                <img src={`/onemove/images/${el.file}`} alt="" draggable="false" decoding="async" />
              </span>
            </div>
          ))}
          {unlocked.length === 0 && (
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
              루틴을 완료하면 첫 요소가 찾아와요
            </div>
          )}
        </div>

        {/* 성장 현황 */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '13px 16px', boxShadow: CARD_SHADOW, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#24523F' }}>이번 {season.name} 완료 {count}개</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#9AA39C' }}>
              요소 {unlocked.length} / {GARDEN_ELEMENTS.length}
            </span>
          </div>
          {next ? (
            <>
              <div style={{ height: 8, borderRadius: 4, background: '#F0EDE8', marginTop: 9, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((count / next.threshold) * 100))}%`,
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #D9F2EE, #F3D978)',
                  }}
                />
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '7px 0 0' }}>
                다음 요소 '{next.name}'까지 {next.threshold - count}개 남았어요
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '7px 0 0' }}>
              이번 {season.name} 정원의 요소가 모두 열렸어요
            </p>
          )}
        </div>

        {/* 앨범 안내 */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '13px 16px', boxShadow: CARD_SHADOW, marginTop: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#24523F', margin: 0 }}>사계절 앨범</p>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '3px 0 0', lineHeight: 1.55 }}>
            {season.name}이 끝나면 완성된 정원이 앨범에 한 장으로 저장되고, 새 계절 정원이 시작돼요.
            열심히 못 한 계절도 그 계절만큼의 정원으로 남아요.
          </p>
        </div>
      </div>
    </div>
  )
}
