import { Routes, Route, Navigate, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthLayout from "./components/auth/AuthLayout";
import AppLayout from "./components/layout/AppLayout";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import Logout from "./components/auth/Logout";
import UserManagement from "./pages/admin/UserManagement";
import Documents from "./pages/documents/Documents";
import Ingestion from "./pages/ingestion/Ingestion";
import QA from "./pages/qa/QA";
import PublicRoute from "./components/auth/PublicRoute";
import { AuthProvider } from "./components/AuthProvider";
import PrivateRoute from "./components/auth/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />

          <Route
            path="/logout"
            element={
              <PrivateRoute>
                <Logout />
              </PrivateRoute>
            }
          />
        </Route>
        <Route element={<AppLayout />}>
          {/* TODO: Protect these routes behind auth and admin role checks */}
          <Route
            path="/users"
            element={
              <PrivateRoute adminOnly>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            }
          />
          <Route
            path="/ingestion"
            element={
              <PrivateRoute>
                <Ingestion />
              </PrivateRoute>
            }
          />
          <Route
            path="/qa"
            element={
              <PrivateRoute>
                <QA />
              </PrivateRoute>
            }
          />
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
    </AuthProvider>
  );
}

export default App;
