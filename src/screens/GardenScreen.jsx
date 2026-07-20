import { useEffect, useState } from 'react'
import { storage } from '../lib/storage'
import { getSeason, countSeasonCompleted, GARDEN_ELEMENTS, getUnlockedElements, getNextElement, SEASON_SETS, getPastSeasons } from '../lib/garden'
import GardenScene from '../components/GardenScene'

const CARD_SHADOW = '0 8px 18px -14px rgba(36,82,63,.2)'

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

  // 앨범: 기록에서 지난 계절 계산 + ?album=숫자 데모 미리보기 (작년 같은 계절 샘플)
  const pastSeasons = getPastSeasons(history, todayKey)
  const albumPreview = Number(params.get('album'))
  if (Number.isFinite(albumPreview) && albumPreview > 0) {
    pastSeasons.unshift({ key: 'album-preview', name: season.name, year: season.year - 1, count: albumPreview })
  }
  const albumEntries = pastSeasons.filter((s) => SEASON_SETS[s.name])

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

        {/* 이번 계절 정원 장면 — 요소들이 상시로 살아 움직임 */}
        <GardenScene
          elements={SEASON_SETS[season.name]?.elements ?? GARDEN_ELEMENTS}
          bg={SEASON_SETS[season.name]?.bg ?? 'garden-summer-bg.jpg'}
          count={count}
          newIds={newIds}
          ariaLabel={`나의 ${season.name} 정원 — 요소 ${unlocked.length}개`}
          emptyHint="루틴을 완료하면 첫 요소가 찾아와요"
          style={{ borderRadius: 20, boxShadow: CARD_SHADOW }}
        />

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
                루틴 {next.threshold - count}개를 더 완료하면 '{next.name}'이(가) 정원에 와요
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '7px 0 0' }}>
              이번 {season.name} 정원의 요소가 모두 열렸어요
            </p>
          )}

          {/* 요소 도감: 열린 요소는 썸네일, 안 열린 요소는 물음표 원 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {unlocked.map((el) => (
              <div
                key={el.id}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#F4F8F3',
                  border: '1.5px solid #DCE7DD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img src={`/onemove/images/${el.file}`} alt={el.name} style={{ width: 32, height: 32, objectFit: 'contain', display: 'block' }} />
              </div>
            ))}
            {GARDEN_ELEMENTS.filter((el) => count < el.threshold).map((el) => (
              <div
                key={el.id}
                aria-label="아직 열리지 않은 요소"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '1.5px dashed #CFC8BD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C4BCB0',
                  fontSize: 15,
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
              {season.name}이 끝나면 완성된 정원이 앨범에 한 장으로 저장되고, 새 계절 정원이 시작돼요.
              열심히 못 한 계절도 그 계절만큼의 정원으로 남아요.
            </p>
          )}
          {albumEntries.length === 0 ? (
            <p style={{ fontSize: 12, fontWeight: 500, color: '#B7AFA4', margin: '8px 0 0' }}>
              아직 모인 계절이 없어요. {season.name}이 끝나면 첫 장이 저장돼요.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 10, marginTop: 11, overflowX: 'auto', paddingBottom: 4 }}>
              {albumEntries.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setAlbumOpen(s)}
                  aria-label={`${s.year} ${s.name} 정원 열람`}
                  style={{ flex: 'none', width: 132, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                >
                  <GardenScene
                    elements={SEASON_SETS[s.name].elements}
                    bg={SEASON_SETS[s.name].bg}
                    count={s.count}
                    style={{ borderRadius: 12, pointerEvents: 'none', border: '1px solid #F0EDE8' }}
                  />
                  <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#5E6F63', marginTop: 5 }}>
                    {s.year} {s.name}
                  </span>
                </button>
              ))}
            </div>
          )}
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
