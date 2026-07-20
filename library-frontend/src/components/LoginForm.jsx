import { useState } from 'react'
import { useMutation } from '@apollo/client/react'

import { LOGIN } from '../queries'

const LoginForm = ({ show, onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [login, result] = useMutation(LOGIN)

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const response = await login({
        variables: { username, password },
      })
      setUsername('')
      setPassword('')
      await onLogin(response.data.login.value)
    } catch {
      setError('login failed')
    }
  }

  return (
    <section>
      <h2>login</h2>
      <form onSubmit={submit}>
        <label>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" disabled={result.loading}>
          login
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  )
}

export default LoginForm
