import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

type SignUpForm = { name: string; email: string; password: string }

function SignUp() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onBlur',
  })

  function onSubmit(_values: SignUpForm) {
    setError(null)
    setIsSubmitting(true)

    // TODO: Implement sign-up API call
    // await authService.signUp(values)
    //   .then(() => navigate('/login'))
    //   .catch((e) => setError(e.message || 'Sign up failed'))

    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
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
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Jane Doe"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>
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
              {isSubmitting ? 'Creating…' : 'Create account'}
            </button>
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


