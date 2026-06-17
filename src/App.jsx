import { useState, useEffect } from 'react'
import { storage } from './lib/storage'
import AppLayout from './components/AppLayout'
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

  useEffect(() => {
    const savedCoach = storage.getCoach()
    const savedState = storage.getTodayState()
    setCoach(savedCoach)
    setTodayState(savedState)
    if (!savedCoach) setScreen('coach-select')
    else if (!savedState) setScreen('state-check')
    else setScreen('home')
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
    // todayState, routines, completed 등 일체 건드리지 않음
  }

  if (!screen) return null

  const showTabBar = screen === 'home' && !!coach && !!todayState

  return (
    <AppLayout showTabBar={showTabBar} activeTab={activeTab} onTabChange={handleTabChange}>
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
              onCoachChange={handleCoachChange}
              onGoToStateCheck={handleGoToStateCheck}
            />
          )}
        </>
      )}
    </AppLayout>
  )
}
