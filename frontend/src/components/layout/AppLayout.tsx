import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../authHook";

function AppLayout() {
  const { user } = useAuth();
  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
        <div className="container">
          <Link className="navbar-brand" to="/">
            RAG App
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#appNavbar"
            aria-controls="appNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="appNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {user?.role === "admin" && (
                <li className="nav-item">
                  <NavLink to="/users" className="nav-link">
                    User Management
                  </NavLink>
                </li>
              )}

              <li className="nav-item">
                <NavLink to="/documents" className="nav-link">
                  Documents
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/ingestion" className="nav-link">
                  Ingestion
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/qa" className="nav-link">
                  Q&A
                </NavLink>
              </li>
            </ul>

            <div className="d-flex">
              <Link to="/logout" className="btn btn-outline-light btn-sm">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-fill py-4">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="py-3 text-center text-secondary small border-top">
        © {new Date().getFullYear()} RAG App
      </footer>
    </div>
  );
}

export default AppLayout;
