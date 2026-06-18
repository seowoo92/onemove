import { useState, useEffect } from 'react'
import { storage } from './lib/storage'
import { supabase } from './lib/supabase'
import AppLayout from './components/AppLayout'
import WelcomeScreen from './screens/WelcomeScreen'
import CoachSelect from './screens/CoachSelect'
import StateCheck from './screens/StateCheck'
import Home from './screens/Home'
import RecordScreen from './screens/RecordScreen'
import SettingsScreen from './screens/SettingsScreen'

export default function App() {
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
      const currentUser = supabase
        ? (await supabase.auth.getSession()).data.session?.user ?? null
        : null
      setUser(currentUser)
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      if (newUser && !storage.getNickname()) applyKakaoNickname(newUser)
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
