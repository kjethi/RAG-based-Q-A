import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Button from '../ui/Button';
import { authService, type SignUpForm } from '../../services/auth';
import { toast } from 'react-toastify';


function SignUp() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid, touchedFields } } = useForm<SignUpForm>({
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onChange',
  })

  async function onSubmit(values: SignUpForm) {
    try {
      await authService.signUp(values)
      toast.success("Signup successful!"); // Show success toast
      navigate("/login");
    } catch (e) {
      let errorMessage = "SignUp failed"; // Default error message
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      else  if (typeof e === 'string') {
        errorMessage = e.toString();
      }
      toast.error(errorMessage); // Show error toast
    }
  }
  
  return (
    <div className="card shadow-sm" role="region" aria-labelledby="signup-title" style={{ maxWidth: 480, width: '100%' }}>
      <div className="card-body p-4">
        <h1 id="signup-title" className="h4 mb-1">Create your account</h1>
        <p className="text-secondary mb-4">Join to access the RAG app.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              id="name"
              type="text"
              className={`form-control ${errors.name && touchedFields.name ? 'is-invalid' : ''}`}
              placeholder="Jane Doe"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            {errors.name && touchedFields.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email && touchedFields.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /[^\s@]+@[^\s@]+\.[^\s@]+/,
                  message: 'Enter a valid email',
                },
              })}
            />
            {errors.email && touchedFields.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password && touchedFields.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            {errors.password && touchedFields.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button type="submit" isLoading={isSubmitting} disabled={!isValid} loadingText='Creating…'>
              Create account
            </Button>
            <span className="text-secondary">
              Have an account?{' '}
              <Link className="link-primary" to="/login">Sign in</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp


