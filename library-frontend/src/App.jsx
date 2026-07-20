import { useState } from 'react'
import { useApolloClient } from '@apollo/client/react'

import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import Recommendations from './components/Recommendations'

const tokenKey = 'library-user-token'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(() =>
    window.localStorage.getItem(tokenKey),
  )
  const client = useApolloClient()
  const loggedIn = Boolean(token)

  const handleLogin = async (newToken) => {
    window.localStorage.setItem(tokenKey, newToken)
    setToken(newToken)
    setPage('authors')
    await client.resetStore()
  }

  const handleLogout = () => {
    window.localStorage.removeItem(tokenKey)
    setToken(null)
    setPage('authors')
  }

  return (
    <div>
      <nav aria-label="main navigation">
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {loggedIn ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={handleLogout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </nav>

      <Authors show={page === 'authors'} loggedIn={loggedIn} />
      <Books show={page === 'books'} />
      {loggedIn && <NewBook show={page === 'add'} />}
      {loggedIn && <Recommendations show={page === 'recommend'} />}
      {!loggedIn && (
        <LoginForm show={page === 'login'} onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
