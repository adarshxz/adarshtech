import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { routeToSection } from '../data/site'
import Profile from '../components/Profile'
import Banner from '../scene/Scene'
import {
  About,
  Connect,
  Certifications,
  Experience,
  Education,
  Activity,
  ProjectsPreview,
  Skills,
  Achievements,
  ClosingCta,
} from '../components/Sections'

export default function Home() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = 'Adarsh Singh — Full-stack & AI engineer'
  }, [])

  useEffect(() => {
    const id = routeToSection[pathname]
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return undefined
    }
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }), 60)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <>
      <Banner />
      <Profile />
      <About />
      <Connect />
      <Certifications />
      <Experience />
      <Education />
      <Activity />
      <ProjectsPreview />
      <Skills />
      <Achievements />
      <ClosingCta />
    </>
  )
}
