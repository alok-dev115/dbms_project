import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import NotificationToast from './components/NotificationToast'
import Navbar from './components/Navbar'
import AgentDetail from './pages/AgentDetail'
import Agents from './pages/Agents'
import CustomQuery from './pages/CustomQuery'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import Queries from './pages/Queries'
import Rentals from './pages/Rentals'
import Reports from './pages/Reports'
import Sales from './pages/Sales'
import { useApp } from './context/AppContext'

export default function App() {
  const { theme } = useApp()

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light')
  }, [theme])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/queries" element={<Queries />} />
        <Route path="/custom-query" element={<CustomQuery />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <NotificationToast />
    </>
  )
}
