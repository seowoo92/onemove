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
    storage.setTodayState(state)
    setTodayState(state)
    setScreen('home')
    setActiveTab('home')
  }

  function handleGoToStateCheck() {
    setTodayState(null)
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
          onBack={() => setScreen('coach-select')}
        />
      )}
      {screen === 'home' && coach && (
        <>
          {activeTab === 'home' && todayState && (
            <Home key={homeKey} coach={coach} todayState={todayState} nickname={nickname} onGoToStateCheck={handleGoToStateCheck} />
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
        </>
      )}
    </AppLayout>
  )
}
