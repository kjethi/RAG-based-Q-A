import { Routes, Route, Navigate, Link } from 'react-router-dom'
import AuthLayout from './components/auth/AuthLayout'
import AppLayout from './components/layout/AppLayout'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Logout from './components/auth/Logout'
import UserManagement from './pages/admin/UserManagement'
import Documents from './pages/documents/Documents'
import Ingestion from './pages/ingestion/Ingestion'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logout" element={<Logout />} />
      </Route>
      <Route element={<AppLayout />}>
        {/* TODO: Protect these routes behind auth and admin role checks */}
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/ingestion" element={<Ingestion />} />
      </Route>
      <Route
        path="*"
        element={
          <div style={{ padding: 24 }}>
            <h1>404</h1>
            <p>Page not found.</p>
            <Link to="/login">Go to Login</Link>
          </div>
        }
      />
    </Routes>
  )
}

export default App
