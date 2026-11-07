import { Route, Routes } from 'react-router'
import Layout from './Layout.tsx'
import HomePage from './pages/HomePage.tsx'
import LevelPage from './pages/LevelPage.tsx'
import { tools } from './routes.ts'

function App() {
  return (
    <Routes>
      {/* Top page: no sidebar, just links to the tools. */}
      <Route index element={<HomePage />} />
      {/* Tool pages share the sidebar layout. */}
      <Route element={<Layout />}>
        <Route path={tools.levelUpShards.path} element={<LevelPage />} />
      </Route>
    </Routes>
  )
}

export default App
