import { Link, NavLink, Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
        <div className="container">
          <Link to="/login" className="navbar-brand" aria-label="Home">
            RAG App
          </Link>
          <div className="ms-auto d-flex gap-2">
            <NavLink to="/login" className="btn btn-outline-light btn-sm">Login</NavLink>
            <NavLink to="/signup" className="btn btn-primary btn-sm">Sign Up</NavLink>
          </div>
        </div>
      </nav>

      <main className="flex-fill py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 d-none d-md-flex flex-column pe-md-5 mb-4 mb-md-0">
              <h2 className="display-6 fw-semibold">Welcome to RAG App</h2>
              <p className="text-secondary mb-0">A lightweight starter. Replace this with your brand, features, or illustration.</p>
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-center">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-3 text-center text-secondary small border-top border-secondary">
        © {new Date().getFullYear()} RAG App
      </footer>
    </div>
  )
}

export default AuthLayout


