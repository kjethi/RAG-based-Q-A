import { Routes, Route, Navigate, Link } from 'react-router-dom'
import AuthLayout from './components/auth/AuthLayout'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Logout from './components/auth/Logout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logout" element={<Logout />} />
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
