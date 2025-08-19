import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

type LoginForm = { email: string; password: string }

function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  function onSubmit(_values: LoginForm) {
    setError(null)
    setIsSubmitting(true)

    // TODO: Implement login API call
    // await authService.login(values)
    //   .then(() => navigate('/dashboard'))
    //   .catch((e) => setError(e.message || 'Login failed'))

    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="card shadow-sm" role="region" aria-labelledby="login-title" style={{ maxWidth: 480, width: '100%' }}>
      <div className="card-body p-4">
        <h1 id="login-title" className="h4 mb-1">Welcome back</h1>
        <p className="text-secondary mb-4">Login to your account to continue.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /[^\s@]+@[^\s@]+\.[^\s@]+/,
                  message: 'Enter a valid email',
                },
              })}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
            <span className="text-secondary">
              No account?{' '}
              <Link className="link-primary" to="/signup">Create one</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login


