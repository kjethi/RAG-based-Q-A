// Lightweight stub of an auth service with TODOs for real implementation

export type LoginInput = {
  email: string
  password: string
}

export type SignUpInput = {
  name: string
  email: string
  password: string
}

export const authService = {
  async login(_input: LoginInput): Promise<void> {
    // TODO: Call backend API to login and store session/token
    // Example:
    // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(input) })
    // if (!res.ok) throw new Error('Invalid credentials')
    return
  },

  async signUp(_input: SignUpInput): Promise<void> {
    // TODO: Call backend API to sign up a new user
    return
  },

  async logout(): Promise<void> {
    // TODO: Clear session/token and notify backend if needed
    return
  },
}


