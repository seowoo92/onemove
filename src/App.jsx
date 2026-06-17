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

  useEffect(() => {
    async function init() {
      const currentUser = supabase
        ? (await supabase.auth.getSession()).data.session?.user ?? null
        : null
      setUser(currentUser)

      const savedCoach = storage.getCoach()
      const savedState = storage.getTodayState()
      setCoach(savedCoach)
      setTodayState(savedState)

      if (!savedCoach) {
        // 카카오 OAuth 복귀 시(currentUser 있음)는 welcome 건너뛰고 코치 선택으로
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
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleCoachSelect(personality) {
    storage.setCoach(personality)
    setCoach(personality)
    setScreen('state-check')
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
    if (tab === 'home') setHomeKey(k => k + 1)
    setActiveTab(tab)
  }

  function handleCoachChange(newCoach) {
    storage.setCoach(newCoach)
    setCoach(newCoach)
  }

  if (!screen) return null

  const showTabBar = screen === 'home' && !!coach && !!todayState

  return (
    <AppLayout showTabBar={showTabBar} activeTab={activeTab} onTabChange={handleTabChange}>
      {screen === 'welcome' && (
        <WelcomeScreen onSkip={() => setScreen('coach-select')} />
      )}
      {screen === 'coach-select' && (
        <CoachSelect initialSelected={coach} onSelect={handleCoachSelect} />
      )}
      {screen === 'state-check' && (
        <StateCheck
          onSelect={handleStateSelect}
          onBack={() => setScreen('coach-select')}
        />
      )}
      {screen === 'home' && coach && todayState && (
        <>
          {activeTab === 'home' && (
            <Home key={homeKey} coach={coach} todayState={todayState} onGoToStateCheck={handleGoToStateCheck} />
          )}
          {activeTab === 'record' && <RecordScreen />}
          {activeTab === 'settings' && (
            <SettingsScreen
              coach={coach}
              user={user}
              onCoachChange={handleCoachChange}
              onGoToStateCheck={handleGoToStateCheck}
            />
          )}
        </>
      )}
    </AppLayout>
  )
}
