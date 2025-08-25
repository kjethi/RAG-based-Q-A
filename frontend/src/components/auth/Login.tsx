import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authService, type LoginForm } from "../../services/auth";
import { toast } from "react-hot-toast"; // Add this import
import { setAuthorizationHeader } from "../../services/api";
import { setAuthCookies } from "../../utils/cookiesHelper";
import { useAuth } from "../../authHook";
import Button from "../ui/Button";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function onSubmit(values: LoginForm) {
    try {
      const response = await authService.login(values);
      console.log("response", response.token);
      setAuthorizationHeader(`Bearer ${response.token}`);
      setAuthCookies(response.token);
      setUser(response.user);
      toast.success("Login successful!"); // Show success toast
      console.log("response.user.role", response.user.role);

      if (response.user.role === "admin") {
        navigate("/users");
      } else {
        navigate("/documents");
      }
    } catch (e) {
      let errorMessage = "Login failed"; // Default error message
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      toast.error(errorMessage); // Show error toast
    }
  }

  return (
    <div
      className="card shadow-sm"
      role="region"
      aria-labelledby="login-title"
      style={{ maxWidth: 480, width: "100%" }}
    >
      <div className="card-body p-4">
        <h1 id="login-title" className="h4 mb-1">
          Welcome back
        </h1>
        <p className="text-secondary mb-4">
          Login to your account to continue.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-control ${
                errors.email && touchedFields.email ? "is-invalid" : ""
              }`}
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /[^\s@]+@[^\s@]+\.[^\s@]+/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && touchedFields.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-control ${
                errors.password && touchedFields.password ? "is-invalid" : ""
              }`}
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
            />
            {errors.password && touchedFields.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            
            <Button type="submit" isLoading={isSubmitting} disabled={!isValid} loadingText="Signing in…">
              Sign in
            </Button>


            <span className="text-secondary">
              No account?
              <Link className="link-primary" to="/signup">
                Create one
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
