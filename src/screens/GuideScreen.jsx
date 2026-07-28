import { useState } from 'react'

// 사용자 안내서 — 설정 탭 '사용법 안내'에서 진입.
// 섹션 = 흰 그룹 카드(연녹 헤더 띠), 항목 = 카드 안의 아코디언 행 (2026-07-26 사용자 확정: 3안, 섹션·항목 14px 통일)
// 문구는 앱 톤 원칙(존댓말·무판단·권유 압박 금지)을 따른다.

const CARD_SHADOW = '0 8px 18px -14px rgba(36,82,63,.2)'

const AREA_CHIPS = [
  { label: '몸 움직이기', bg: '#D5EFD8', color: '#24523F' },
  { label: '자기돌봄', bg: '#D5EFD8', color: '#24523F' },
  { label: '에너지', bg: '#D5EFD8', color: '#24523F' },
  { label: '공간 정리', bg: '#E4F0F6', color: '#3D6E8A' },
  { label: '바깥 활동', bg: '#E4F0F6', color: '#3D6E8A' },
  { label: '마음 연결', bg: '#FBE3DA', color: '#9B5B45' },
  { label: '성취', bg: '#FBE3DA', color: '#9B5B45' },
]

const SECTIONS = [
  {
    label: '앱으로 쓰기',
    items: [
      {
        id: 'install',
        title: '홈 화면에 설치하기',
        body: [
          '오늘만큼은 설치 없이 쓰는 웹앱이지만, 홈 화면에 추가하면 일반 앱처럼 아이콘으로 열 수 있어요. 아이폰에서는 앱 알림(푸시)도 홈 화면에 추가한 앱에서만 받을 수 있어요.',
          '아이폰(사파리): 하단 공유 버튼 → [홈 화면에 추가] → [추가]',
          '아이폰(크롬): 주소창 옆 공유 버튼 → [홈 화면에 추가] → [추가]',
          '안드로이드(크롬): 오른쪽 위 점 세 개 메뉴 → [홈 화면에 추가] 또는 [앱 설치]',
        ],
      },
    ],
  },
  {
    label: '오늘의 루틴',
    items: [
      {
        id: 'weather',
        title: '마음 날씨와 추천 개수',
        body: [
          '하루는 오늘의 마음 날씨를 고르며 시작해요. 좋아요(맑음)는 4개, 보통이에요(구름)는 3개, 힘들어요(비)는 2개. 힘든 날일수록 가볍게 추천해요.',
          '마음 날씨를 다시 고르면 오늘 루틴이 새로 준비되고, 오늘의 완료 기록은 처음부터 다시 시작돼요.',
        ],
      },
      {
        id: 'easy',
        title: '지금은 어려워요 · 쉬운 버전',
        body: [
          '루틴이 버겁게 느껴지면 [지금은 어려워요]를 눌러 보세요. 같은 루틴의 더 쉬운 버전으로 바뀌어요.',
          '카드 위 [원래 버전으로 ⇄]를 누르면 언제든 원래 난이도로 돌아갈 수 있어요.',
        ],
      },
      {
        id: 'swap',
        title: '다른 루틴으로 바꾸기',
        body: [
          '오늘따라 마음이 가지 않는 루틴은, 카드 왼쪽 위 새로고침 아이콘을 눌러 비슷한 난이도의 다른 루틴과 바꿀 수 있어요.',
          '바꾸기는 카드마다 한 번씩이에요.',
        ],
      },
      {
        id: 'pinned',
        title: '매일 루틴 (별 표시)',
        body: [
          '카드 왼쪽 위 별을 켜 두면, 그 루틴은 매일 추천 맨 앞에 들어와요. 최대 3개까지 담을 수 있어요.',
        ],
      },
      {
        id: 'rest',
        title: '오늘은 쉬어가기',
        body: [
          '쉬어가는 것도 하루를 정리하는 방법이에요. [오늘은 쉬어가기]를 골라도 잃는 것은 없고, 코치가 안심의 한마디를 건네요.',
        ],
      },
      {
        id: 'undo',
        title: '완료를 되돌리고 싶을 때',
        body: [
          '실수로 완료했다면, 완료된 행 왼쪽의 체크 원을 한 번 더 눌러 보세요. 체크가 풀리며 카드가 원래 자리로 돌아와요.',
        ],
      },
    ],
  },
  {
    label: '기록과 정원',
    items: [
      {
        id: 'areas',
        title: '루틴의 7가지 영역',
        body: [
          '루틴은 7가지 영역에서 서로 겹치지 않게 골라 드려요. 하루가 한쪽으로 치우치지 않도록요.',
        ],
        chips: AREA_CHIPS,
      },
      {
        id: 'garden',
        title: '계절 정원과 사계절 앨범',
        body: [
          '루틴을 완료할 때마다 정원 탭의 계절 정원에 새 친구가 하나씩 찾아와요. 쉬어간 날이 있어도 정원은 시들지 않아요.',
          '계절이 끝나면 완성된 정원은 폴라로이드 사진으로 앨범에 남고, 새 계절의 정원이 시작돼요.',
        ],
      },
    ],
  },
  {
    label: '알림',
    items: [
      {
        id: 'kakao',
        title: '카카오톡 알림과 다시 받기',
        body: [
          '카카오 로그인 후 설정에서 알림을 켜면, 오늘 루틴을 정할 때 루틴 카드가 카카오톡 \'나와의 채팅\'으로 도착하고, 저녁 6시에 남은 루틴이 있으면 한 번 더 알려드려요.',
          '\'나와의 채팅\'이라 알림음 없이 조용히 도착해요. 루틴 구성이 바뀌었다면 홈 아래 [오늘 루틴 카톡으로 받기]로 새 카드를 받을 수 있어요.',
        ],
      },
    ],
  },
]

function GuideItem({ item, isOpen, onToggle, isFirst }) {
  return (
    <div style={{ padding: isOpen ? '11px 16px 7px' : '11px 16px', borderTop: isFirst ? 'none' : '1px solid #F0EDE6', transition: 'padding .28s ease' }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#24523F' }}>{item.title}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#B7AFA4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} aria-hidden="true">
          <path d="M4 6.5l4 4 4-4" />
        </svg>
      </button>

      {/* 부드러운 펼침 — 기록 탭 아코디언과 동일한 grid-rows 0fr↔1fr 트랜지션 */}
      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows .28s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingTop: 8, paddingBottom: 5 }}>
            {item.body.map((line, i) => (
              <p key={i} style={{ fontSize: 13.5, fontWeight: 500, color: '#5C6B61', lineHeight: 1.6, wordBreak: 'keep-all', margin: i === 0 ? 0 : '7px 0 0' }}>
                {line}
              </p>
            ))}
            {item.chips && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {item.chips.map(({ label, bg, color }) => (
                  <span key={label} style={{ fontSize: 12, fontWeight: 600, color, background: bg, borderRadius: 8, padding: '4px 9px' }}>
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GuideScreen({ onBack }) {
  const [openId, setOpenId] = useState(SECTIONS[0].items[0].id)

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#FAF6F0' }}>
      {/* 하단 패딩 96px — 모바일(window 스크롤)에선 고정 탭바가 콘텐츠를 덮으므로 화면이 직접 확보 (기록 탭 pb-24와 동일) */}
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', padding: '18px 20px 96px', boxSizing: 'border-box' }}>
        {/* 뒤로 버튼 — 마음 날씨 화면과 동일한 흰 카드 */}
        <button
          onClick={onBack}
          aria-label="뒤로"
          style={{
            width: 42,
            height: 42,
            background: '#fff',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            boxShadow: '0 6px 14px -8px rgba(36,82,63,.3),inset 0 2px 0 rgba(255,255,255,.9)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M10 3l-5 5 5 5" fill="none" stroke="#24523F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 23, fontWeight: 800, color: '#24523F', margin: 0 }}>사용법 안내</h2>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#8A9E94', margin: '2px 0 0' }}>오늘만큼을 편하게 쓰는 방법을 모아뒀어요</p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.label} style={{ marginTop: 14 }}>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#1C3F2F', letterSpacing: '0.01em', padding: '11px 16px 10px', background: '#DDEBE0', margin: 0 }}>
                {section.label}
              </p>
              {section.items.map((item, idx) => (
                <GuideItem
                  key={item.id}
                  item={item}
                  isFirst={idx === 0}
                  isOpen={openId === item.id}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
