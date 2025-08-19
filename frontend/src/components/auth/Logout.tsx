import { useEffect } from 'react'

function Logout() {
  useEffect(() => {
    // TODO: Implement logout logic
    // Suggested shape:
    // await authService.logout()
    // navigate('/login')
  }, [])

  return (
    <div className="card shadow-sm" style={{ maxWidth: 480, width: '100%' }}>
      <div className="card-body p-4">
        <h1 className="h4 mb-1">Signing you out…</h1>
        <p className="text-secondary">You will be redirected shortly.</p>
      </div>
    </div>
  )
}

export default Logout


