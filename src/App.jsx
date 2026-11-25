import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CommandMenu from './components/CommandMenu'
import Home from './pages/Home'
import ProjectsPage from './pages/ProjectsPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="site">
        <Header />
        <Routes>
          <Route
            path="*"
            element={
              <>
                <main id="main" className="site-main">
                  <NotFoundPage />
                </main>
                <Footer variant="not-found" />
              </>
            }
          />
          <Route
            path="/"
            element={
              <>
                <main id="main" className="site-main">
                  <Home />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/projects"
            element={
              <>
                <main id="main" className="site-main">
                  <ProjectsPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <main id="main" className="site-main">
                  <ContactPage />
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
      <CommandMenu />
    </>
  )
}
