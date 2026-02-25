
import { Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import { supabase } from './lib/supabase'
import Dashboard from './pages/dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import GroupRoom from './pages/room'
function App() {

  return (  
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

       <Route path="/dashboard/room/:groupId" element={
          <ProtectedRoute>
            <GroupRoom />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App
