import { useState } from 'react'
import { storage } from '../lib/storage'
import { getSeason, countSeasonCompleted, GARDEN_ELEMENTS, getUnlockedElements, getNextElement, SEASON_SETS, getPastSeasons } from '../lib/garden'
import GardenScene from '../components/GardenScene'
import ScreenHeader from '../components/ScreenHeader'

const CARD_SHADOW = '0 8px 18px -14px rgba(36,82,63,.2)'

const SEASON_NAMES = ['봄', '여름', '가을', '겨울']
const SEASON_EN = { 봄: 'spring', 여름: 'summer', 가을: 'autumn', 겨울: 'winter' }

export default function GardenScreen() {
  const history = storage.getHistory()
  const todayKey = storage.getTodayKey()
  const season = getSeason(todayKey)
  // ?garden=숫자 미리보기 (개발 확인·발표 데모용) — 기록·seen 저장에는 영향 없음
  const params = new URLSearchParams(window.location.search)
  const previewCount = Number(params.get('garden'))
  const isPreview = Number.isFinite(previewCount) && previewCount > 0
  const count = isPreview ? previewCount : countSeasonCompleted(history, season)
  const unlocked = getUnlockedElements(count)
  const next = getNextElement(count)

  const [showAlbumInfo, setShowAlbumInfo] = useState(false)
  const [albumOpen, setAlbumOpen] = useState(null) // 열람 중인 지난 계절 | null

  // 앨범: 기록에서 지난 계절 계산 (별도 저장 없음)
  const pastSeasons = getPastSeasons(history, todayKey)
  const albumEntries = pastSeasons.filter((s) => SEASON_SETS[s.name])
  // 앨범 페이지는 당분간 올해만 표시 (이전 연도는 데이터가 쌓인 뒤 노출 검토 — 사용자 결정 2026-07-20)
  const albumYears = [season.year]

  // 새로 열린 요소는 바로 배치하지 않고 '맞이하기'로 대기 — 화면을 탭하면 순서대로 피어난다
  const [pendingIds, setPendingIds] = useState(() => {
    const seen = isPreview ? 0 : storage.getGardenSeen()
    return new Set(GARDEN_ELEMENTS.filter((el) => el.threshold > seen && count >= el.threshold).map((el) => el.id))
  })
  const [revealIds, setRevealIds] = useState(new Set())
  function handleReveal() {
    if (pendingIds.size === 0) return
    if (!isPreview) storage.setGardenSeen(count)
    setRevealIds(pendingIds)
    setPendingIds(new Set())
    // 등장 연출(0.7초 + 스태거)이 끝나면 상시 움직임으로 전환
    setTimeout(() => setRevealIds(new Set()), 900 + pendingIds.size * 130)
  }

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#FAF6F0' }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', padding: '8px 20px 16px' }}>
        <ScreenHeader title="나의 정원" subtitle={`${season.year} ${season.name} · 루틴을 완료하면 정원이 자라나요`} />

        {/* 이번 계절 정원 장면 — 새 요소가 기다리면 탭해서 맞이한다 */}
        <div
          onClick={handleReveal}
          role={pendingIds.size > 0 ? 'button' : undefined}
          aria-label={pendingIds.size > 0 ? '새 요소 맞이하기' : undefined}
          style={{ position: 'relative', cursor: pendingIds.size > 0 ? 'pointer' : 'default' }}
        >
          <GardenScene
            elements={SEASON_SETS[season.name]?.elements ?? GARDEN_ELEMENTS}
            bg={SEASON_SETS[season.name]?.bg ?? 'garden-summer-bg.jpg'}
            count={count}
            newIds={revealIds}
            hiddenIds={pendingIds}
            ariaLabel={`나의 ${season.name} 정원 — 요소 ${unlocked.length}개`}
            emptyHint={pendingIds.size > 0 ? null : '루틴을 완료하면 첫 요소가 찾아와요'}
            style={{ borderRadius: 20, boxShadow: CARD_SHADOW }}
          />
          {pendingIds.size > 0 && (
            <div
              className="garden-pending-pill"
              style={{
                position: 'absolute',
                left: '50%',
                top: '42%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,255,255,.9)',
                borderRadius: 999,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 700,
                color: '#24523F',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 6px 16px -8px rgba(36,82,63,.35)',
              }}
            >
              정원을 채워나갈 요소가 생겼어요
            </div>
          )}
        </div>

        {/* 성장 현황 */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '13px 16px', boxShadow: CARD_SHADOW, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#24523F' }}>이번 {season.name}에 완료한 루틴 {count}개</span>
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
                루틴 {next.threshold - count}개를 더 완료하면 {next.arrival}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '7px 0 0' }}>
              이번 {season.name} 정원의 요소가 모두 열렸어요
            </p>
          )}

          {/* 요소 도감: 한 줄 10개 — 열린 요소는 썸네일, 안 열린 요소는 물음표 원 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, marginTop: 12 }}>
            {unlocked.map((el) => (
              <div
                key={el.id}
                style={{
                  aspectRatio: '1',
                  borderRadius: '50%',
                  background: '#F4F8F3',
                  border: '1.5px solid #DCE7DD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={`/onemove/images/${el.file.replace('.png', '-thumb.png')}`}
                  alt={el.name}
                  style={{ width: '90%', height: '90%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            ))}
            {GARDEN_ELEMENTS.filter((el) => count < el.threshold).map((el) => (
              <div
                key={el.id}
                aria-label="아직 열리지 않은 요소"
                style={{
                  aspectRatio: '1',
                  borderRadius: '50%',
                  border: '1.5px dashed #CFC8BD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C4BCB0',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ?
              </div>
            ))}
          </div>
        </div>

        {/* 사계절 앨범 — 지난 계절 미니 정원, 탭하면 크게 열람 */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '13px 16px', boxShadow: CARD_SHADOW, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#24523F', margin: 0 }}>사계절 앨범</p>
            <button
              onClick={() => setShowAlbumInfo((v) => !v)}
              aria-label="사계절 앨범 설명 보기"
              aria-expanded={showAlbumInfo}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1.5px solid #DCD5C9',
                background: showAlbumInfo ? '#F0EDE8' : '#FFFFFF',
                color: '#9AA69D',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                lineHeight: 1,
                padding: 0,
              }}
            >
              ?
            </button>
          </div>
          {showAlbumInfo && (
            <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '8px 0 0', lineHeight: 1.55 }}>
              계절이 끝날 때마다 그 계절의 정원이 앨범에 한 장씩 모여요.
              <br />봄(3~5월) · 여름(6~8월) · 가을(9~11월) · 겨울(12~2월)
            </p>
          )}
          {/* 연도별 페이지: 계절 슬롯 2×2 — 채워진 계절은 폴라로이드, 빈 계절은 점선 프레임 */}
          {albumYears.map((year) => (
            <div key={year}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '13px 0 10px' }}>
                <span style={{ flex: 1, height: 1, background: '#EDE7DC' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#9AA69D', letterSpacing: '0.06em' }}>{year}년</span>
                <span style={{ flex: 1, height: 1, background: '#EDE7DC' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 2 }}>
                {SEASON_NAMES.map((name, i) => {
                  const key = `${year}-${SEASON_EN[name]}`
                  const isCurrent = key === season.key
                  const filled = isCurrent
                    ? { key, name, year, count }
                    : albumEntries.find((s) => s.key === key)
                  const tilt = [-1.6, 1.4, 1.2, -1.4][i]

                  if (!filled) {
                    // 계절 시작일과 오늘을 비교 — 미래는 기다림, 과거는 조용히 지나감
                    const startMonth = { spring: '03', summer: '06', autumn: '09', winter: '12' }[SEASON_EN[name]]
                    const isFuture = `${year}-${startMonth}-01` > todayKey
                    return (
                      <div
                        key={key}
                        aria-label={`${year}년 ${name} — 비어 있음`}
                        style={{
                          border: '1.5px dashed #D8D1C5',
                          borderRadius: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          minHeight: 82,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#C4BCB0' }}>{name}</span>
                        <span style={{ fontSize: 9.5, fontWeight: 500, color: '#D3CCC0' }}>
                          {isFuture ? '곧 만나요' : '지나갔어요'}
                        </span>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => setAlbumOpen(filled)}
                      aria-label={`${year}년 ${name} 정원 열람`}
                      style={{
                        background: '#FFFFFF',
                        border: 'none',
                        borderRadius: 5,
                        padding: '4px 4px 0',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px -5px rgba(36,82,63,.3), 0 1px 3px rgba(36,82,63,.12)',
                        transform: `rotate(${tilt}deg)`,
                        position: 'relative',
                        textAlign: 'center',
                      }}
                    >
                      <GardenScene
                        elements={SEASON_SETS[name].elements}
                        bg={SEASON_SETS[name].bg}
                        count={filled.count}
                        style={{ borderRadius: 2, pointerEvents: 'none' }}
                      />
                      <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#5E6F63', padding: '4px 0 5px' }}>
                        {name}
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            position: 'absolute',
                            top: -7,
                            right: -5,
                            background: '#F3D978',
                            color: '#5A4B18',
                            fontSize: 9,
                            fontWeight: 800,
                            borderRadius: 999,
                            padding: '2px 6px',
                            boxShadow: '0 2px 6px rgba(0,0,0,.12)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          가꾸는 중
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* 다음 해 자리 미리 마련 — 표기만 (해마다 새 계절 요소로 이어지는 로드맵) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 2px' }}>
            <span style={{ flex: 1, height: 1, background: '#EDE7DC' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#C9C2B6', letterSpacing: '0.06em' }}>{season.year + 1}년</span>
            <span style={{ flex: 1, height: 1, background: '#EDE7DC' }} />
          </div>
        </div>
      </div>

      {/* 앨범 열람 모달 */}
      {albumOpen && (
        <div
          onClick={() => setAlbumOpen(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20,46,34,.45)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 420, background: '#FFFFFF', borderRadius: 20, padding: '14px 14px 16px', boxShadow: '0 20px 50px rgba(0,0,0,.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
              <span style={{ fontSize: 15.5, fontWeight: 800, color: '#24523F' }}>
                {albumOpen.year} {albumOpen.name} 정원
              </span>
              <button
                onClick={() => setAlbumOpen(null)}
                aria-label="닫기"
                style={{ width: 28, height: 28, borderRadius: 9, border: 'none', background: '#F0EDE8', color: '#6F7D72', fontSize: 14, fontWeight: 700, cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <GardenScene
              elements={SEASON_SETS[albumOpen.name].elements}
              bg={SEASON_SETS[albumOpen.name].bg}
              count={albumOpen.count}
              ariaLabel={`${albumOpen.year} ${albumOpen.name} 정원`}
              style={{ borderRadius: 14, marginTop: 10 }}
            />
            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#8A9E94', margin: '10px 2px 0' }}>
              {albumOpen.name} 동안 완료한 루틴 {albumOpen.count}개 · 요소{' '}
              {SEASON_SETS[albumOpen.name].elements.filter((el) => albumOpen.count >= el.threshold).length} / {SEASON_SETS[albumOpen.name].elements.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
