import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Header from './components/Header/Header'
import SettingsBar, { type Settings } from './components/SettingsBar/SettingsBar'
import CourseList from './components/CourseList/CourseList'
import TimeGrid from './components/TimeGrid/TimeGrid'
import DataTransfer from './components/DataTransfer/DataTransfer'
import DevFill from './components/DevFill/DevFill'
import RouteResults from './components/RouteResults/RouteResults'
import { COURSES, OLD_COURSES, NEW_COURSES } from './data/gameData'
import {
  comboKey,
  findTopRoutes,
  type TimesData,
} from './utils/optimizer'
import type { Course, Rider, Star } from './types/types'

const TIMES_KEY = 'kar-router:times'
const SETTINGS_KEY = 'kar-router:settings'

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

const DEFAULT_SETTINGS: Settings = {
  noDupeRiders: false,
  noDupeStars: true,
  allowLegendary: true,
}

function App() {
  const [times, setTimes] = useState<TimesData>(() =>
    loadStored<TimesData>(TIMES_KEY, {}),
  )
  const [settings, setSettings] = useState<Settings>(() =>
    loadStored(SETTINGS_KEY, DEFAULT_SETTINGS),
  )
  const [selectedCourse, setSelectedCourse] = useState<Course>(COURSES[0])

  useEffect(() => {
    localStorage.setItem(TIMES_KEY, JSON.stringify(times))
  }, [times])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  const setTime = (
    course: Course,
    star: Star,
    rider: Rider,
    ms: number | null,
  ) => {
    setTimes((prev) => {
      const record = { ...(prev[course] ?? {}) }
      const key = comboKey(star, rider)
      if (ms === null) delete record[key]
      else record[key] = ms
      return { ...prev, [course]: record }
    })
  }

  const clearCourseTimes = (course: Course) => {
    setTimes((prev) => {
      const next = { ...prev }
      delete next[course]
      return next
    })
  }

  const clearAllTimes = () => setTimes({})

  const importReplace = (imported: TimesData, importedSettings: Settings | null) => {
    setTimes(imported)
    if (importedSettings) setSettings(importedSettings)
  }

  const importMerge = (imported: TimesData) => {
    setTimes((prev) => {
      const next = { ...prev }
      for (const [course, record] of Object.entries(imported)) {
        next[course as Course] = { ...next[course as Course], ...record }
      }
      return next
    })
  }

  const allResult = useMemo(
    () => findTopRoutes(COURSES, times, settings),
    [times, settings],
  )
  const oldResult = useMemo(
    () => findTopRoutes(OLD_COURSES, times, settings),
    [times, settings],
  )
  const newResult = useMemo(
    () => findTopRoutes(NEW_COURSES, times, settings),
    [times, settings],
  )

  return (
    <>
      <Header />
      <SettingsBar settings={settings} onChange={setSettings}>
        <DataTransfer
          times={times}
          settings={settings}
          onReplace={importReplace}
          onMerge={importMerge}
        />
        {import.meta.env.DEV && <DevFill onFill={importMerge} />}
      </SettingsBar>
      <main className="planner">
        <CourseList
          times={times}
          selected={selectedCourse}
          onSelect={setSelectedCourse}
        />
        <TimeGrid
          course={selectedCourse}
          record={times[selectedCourse] ?? {}}
          allowLegendary={settings.allowLegendary}
          onSetTime={setTime}
          onClearCourse={clearCourseTimes}
          onClearAll={clearAllTimes}
        />
      </main>
      <RouteResults
        all={allResult}
        oldCourses={oldResult}
        newCourses={newResult}
      />
    </>
  )
}

export default App
