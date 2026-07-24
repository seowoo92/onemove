import { useState, useEffect } from 'react'
import { storage } from './lib/storage'
import { supabase } from './lib/supabase'
import { reconcileOnLogin, startSync, stopSync } from './lib/sync'
import { saveKakaoTokens } from './lib/kakao'
import AppLayout from './components/AppLayout'
import WelcomeScreen from './screens/WelcomeScreen'
import CoachSelect from './screens/CoachSelect'
import StateCheck from './screens/StateCheck'
import Home from './screens/Home'
import GardenScreen from './screens/GardenScreen'
import RecordScreen from './screens/RecordScreen'
import SettingsScreen from './screens/SettingsScreen'

export default function App() {
  // ?crash=1 — 에러 안내화면(ErrorBoundary) 확인용 (QA·디자인 점검)
  if (new URLSearchParams(window.location.search).get('crash') === '1') {
    throw new Error('crash test (?crash=1)')
  }

  const [screen, setScreen] = useState(null)
  const [coach, setCoach] = useState(null)
  const [todayState, setTodayState] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [homeKey, setHomeKey] = useState(0)
  const [user, setUser] = useState(null)
  const [nickname, setNickname] = useState('')
  const [coachSelectFrom, setCoachSelectFrom] = useState(null)
  const [stateCheckFrom, setStateCheckFrom] = useState(null) // 'home' = 홈의 '마음 날씨 다시 고르기'로 진입

  function applyKakaoNickname(currentUser) {
    if (!currentUser) return
    if (storage.getNickname()) return
    const kakaoNick =
      currentUser.user_metadata?.name ??
      currentUser.user_metadata?.full_name ??
      currentUser.user_metadata?.preferred_username ??
      ''
    if (kakaoNick) {
      storage.setNickname(kakaoNick)
      setNickname(kakaoNick)
    }
  }

  useEffect(() => {
    async function init() {
      // 백엔드가 응답하지 않아도(예: Supabase 무료플랜 자동 일시정지) 앱은 게스트로 계속 뜨도록 3초 제한
      let currentUser = null
      if (supabase) {
        try {
          const { data } = await Promise.race([
            supabase.auth.getSession(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('auth timeout')), 3000)),
          ])
          currentUser = data.session?.user ?? null
        } catch {
          currentUser = null
        }
      }
      setUser(currentUser)
      if (currentUser) {
        // 서버 기록 보충(기기 간 이어쓰기)은 2.5초 안에 안 되면 건너뛴다 — 화면 진입을 막지 않게
        await Promise.race([reconcileOnLogin(currentUser.id), new Promise((r) => setTimeout(r, 2500))])
        startSync(currentUser.id)
      }
      const stored = storage.getNickname()
      setNickname(stored)
      if (!stored) applyKakaoNickname(currentUser)

      const savedCoach = storage.getCoach()
      const savedState = storage.getTodayState()
      setCoach(savedCoach)
      setTodayState(savedState)

      if (!savedCoach) {
        setScreen(currentUser ? 'coach-select' : 'welcome')
      } else if (!savedState) {
        setScreen('state-check')
      } else {
        setScreen('home')
      }
    }

    init()

    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      if (newUser && !storage.getNickname()) applyKakaoNickname(newUser)
      // 갓 로그인한 세션에만 정확한 카카오 토큰이 실려 온다 (INITIAL_SESSION의 옛 토큰으로 덮어쓰기 금지)
      if (event === 'SIGNED_IN') saveKakaoTokens(session)
      if (newUser) {
        reconcileOnLogin(newUser.id).finally(() => {
          startSync(newUser.id)
          // 서버에서 받아온 최신 프로필(닉네임·코치)을 화면에도 반영
          setNickname(storage.getNickname())
          setCoach(storage.getCoach())
        })
      } else {
        stopSync()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleCoachSelect(personality) {
    storage.setCoach(personality)
    setCoach(personality)
    if (coachSelectFrom === 'settings') {
      setCoachSelectFrom(null)
      setScreen('home')
      setActiveTab('settings')
    } else {
      setCoachSelectFrom(null)
      setScreen('state-check')
    }
  }

  function handleGoToCoachSelectFromSettings() {
    setCoachSelectFrom('settings')
    setScreen('coach-select')
  }

  function handleStateSelect(state) {
    // 오늘 기록 초기화는 새 날씨가 '확정되는 이 시점'에 수행 —
    // 마음 날씨 화면에서 뒤로 돌아가면 기존 루틴·완료 기록이 그대로 남는다
    ;['onemove_routines', 'onemove_completed', 'onemove_easy', 'onemove_easy_auto', 'onemove_swap_used', 'onemove_swapped_out', 'onemove_skipped', 'onemove_review']
      .forEach((k) => localStorage.removeItem(k))
    storage.removeHistoryEntry(storage.getTodayKey())
    storage.setTodayState(state)
    setTodayState(state)
    setStateCheckFrom(null)
    setScreen('home')
    setActiveTab('home')
  }

  function handleGoToStateCheck() {
    setStateCheckFrom('home')
    setScreen('state-check')
    setActiveTab('home')
  }

  function handleTabChange(tab) {
    if (tab === 'home') {
      setHomeKey(k => k + 1)
      setScreen(todayState ? 'home' : 'state-check')
    } else {
      setScreen('home')
    }
    setActiveTab(tab)
  }

  function handleCoachChange(newCoach) {
    storage.setCoach(newCoach)
    setCoach(newCoach)
  }

  function handleNicknameChange(newNickname) {
    storage.setNickname(newNickname)
    setNickname(newNickname)
  }

  // 첫 화면이 결정되면 스플래시를 부드럽게 걷어낸다 (index.html에 정의)
  useEffect(() => {
    if (screen) window.__hideSplash?.()
  }, [screen])

  if (!screen) return null

  const showTabBar = !!coach

  return (
    <AppLayout showTabBar={showTabBar} activeTab={activeTab} onTabChange={handleTabChange}>
      {screen === 'welcome' && (
        <WelcomeScreen onSkip={() => setScreen('coach-select')} />
      )}
      {screen === 'coach-select' && (
        <CoachSelect
          initialSelected={coach}
          onSelect={handleCoachSelect}
          onBack={coachSelectFrom === 'settings' ? () => {
            setCoachSelectFrom(null)
            setScreen('home')
            setActiveTab('settings')
          } : null}
        />
      )}
      {screen === 'state-check' && (
        <StateCheck
          onSelect={handleStateSelect}
          onBack={
            stateCheckFrom === 'home'
              ? () => { setStateCheckFrom(null); setScreen('home'); setActiveTab('home') } // 재선택 진입: 홈으로 복귀 (기록 유지)
              : () => setScreen('coach-select') // 온보딩 진입: 코치 선택으로
          }
        />
      )}
      {screen === 'home' && coach && (
        // 탭 전환 페이드인 — key가 바뀔 때마다 새 화면이 살짝 떠오름 (opacity만 사용)
        <div key={activeTab === 'home' ? `home-${homeKey}` : activeTab} className="screen-fade" style={{ minHeight: '100%' }}>
          {activeTab === 'home' && todayState && (
            <Home coach={coach} todayState={todayState} nickname={nickname} onGoToStateCheck={handleGoToStateCheck} />
          )}
          {activeTab === 'home' && !todayState && (
            <StateCheck onSelect={handleStateSelect} onBack={() => setScreen('coach-select')} />
          )}
          {activeTab === 'garden' && <GardenScreen />}
          {activeTab === 'record' && <RecordScreen />}
          {activeTab === 'settings' && (
            <SettingsScreen
              coach={coach}
              user={user}
              nickname={nickname}
              onCoachChange={handleCoachChange}
              onNicknameChange={handleNicknameChange}
              onGoToStateCheck={handleGoToStateCheck}
              onGoToCoachSelect={handleGoToCoachSelectFromSettings}
            />
          )}
        </div>
      )}
    </AppLayout>
  )
}
