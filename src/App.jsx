import { useState, useEffect } from 'react'
import { storage } from './lib/storage'
import CoachSelect from './screens/CoachSelect'
import StateCheck from './screens/StateCheck'
import Home from './screens/Home'

export default function App() {
  const [screen, setScreen] = useState(null)
  const [coach, setCoach] = useState(null)
  const [todayState, setTodayState] = useState(null)

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
  }

  function handleGoToStateCheck() {
    setTodayState(null)
    setScreen('state-check')
  }

  if (!screen) return null

  return (
    <>
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
        <Home
          coach={coach}
          todayState={todayState}
          onGoToStateCheck={handleGoToStateCheck}
        />
      )}
    </>
  )
}
