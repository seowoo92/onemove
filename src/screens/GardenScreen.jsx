import { storage } from '../lib/storage'
import { getSeason, countSeasonCompleted, GARDEN_ELEMENTS, getUnlockedElements, getNextElement } from '../lib/garden'

const CARD_SHADOW = '0 8px 18px -14px rgba(36,82,63,.2)'

// 정원 본 화면은 일러스트 도착 후 구현 — 지금은 계절·성장 현황을 보여주는 준비 화면
export default function GardenScreen() {
  const history = storage.getHistory()
  const season = getSeason(storage.getTodayKey())
  const count = countSeasonCompleted(history, season)
  const unlocked = getUnlockedElements(count)
  const next = getNextElement(count)

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#FAF6F0' }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', padding: '8px 20px 96px' }}>
        <h2 style={{ fontSize: 23, fontWeight: 800, color: '#24523F', margin: '0 0 2px' }}>정원</h2>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '0 0 16px' }}>
          {season.year} {season.name} · 루틴을 완료하면 정원이 자라나요
        </p>

        {/* 정원 미리보기 자리 — 하늘 + 풀밭 */}
        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
          <div
            style={{
              height: 190,
              background: 'linear-gradient(180deg, #CDE6F2 0%, #E9F3EE 62%, #BFDCA8 62%, #A9CD8E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
            }}
          >
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#3A4A40', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
              {season.name} 정원을 가꾸는 중이에요
              <br />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#5E6F63' }}>
                정원 그림이 곧 도착해요 — 열린 요소들이 이 자리에서 살아 움직일 거예요
              </span>
            </p>
          </div>
          <div style={{ background: '#FFFFFF', padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#24523F' }}>이번 {season.name} 완료 {count}개</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9AA39C' }}>
                요소 {unlocked.length} / {GARDEN_ELEMENTS.length}
              </span>
            </div>
            {next && (
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
            )}
            {!next && (
              <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '7px 0 0' }}>
                이번 {season.name} 정원의 요소가 모두 열렸어요
              </p>
            )}
          </div>
        </div>

        {/* 열린 요소 */}
        {unlocked.length > 0 && (
          <>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: '#9AA69D', letterSpacing: '0.02em', margin: '15px 0 7px', paddingLeft: 4 }}>
              정원에 들어온 요소
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {unlocked.map((el) => (
                <span
                  key={el.id}
                  style={{ fontSize: 12.5, fontWeight: 600, color: '#24523F', background: '#EFF4EE', borderRadius: 999, padding: '7px 13px' }}
                >
                  {el.name}
                </span>
              ))}
            </div>
          </>
        )}

        {/* 앨범 안내 */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '13px 16px', boxShadow: CARD_SHADOW, marginTop: 15 }}>
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
