import { useEffect } from "react";
import { useAuth } from "../../authHook";
import { getCookie, removeAuthCookies } from "../../utils/cookiesHelper";
import { setAuthorizationHeader } from "../../services/api";
import { useNavigate } from "react-router-dom";

function Logout() {
  const { setUser } = useAuth();
  const navigate = useNavigate()
  useEffect(() => {
    removeAuthCookies();
    setAuthorizationHeader(null);
    console.log(getCookie("access_token"))
    // Delay only for showing logout page
    setTimeout(() => {
      setUser(null);
      navigate('/login',{replace: true})
    }, 1000);

  }, [navigate, setUser]);

  return (
    <div className="card shadow-sm" style={{ maxWidth: 480, width: "100%" }}>
      <div className="card-body p-4">
        <h1 className="h4 mb-1">Signing you out…</h1>
        <p className="text-secondary">You will be redirected shortly.</p>
      </div>
    </div>
  );
}

export default Logout;
