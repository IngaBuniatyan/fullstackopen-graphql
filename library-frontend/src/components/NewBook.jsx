import { useState } from 'react'
import { useMutation } from '@apollo/client/react'

import { ADD_BOOK } from '../queries'

const NewBook = ({ show }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [addBook, result] = useMutation(ADD_BOOK, {
    refetchQueries: 'active',
    awaitRefetchQueries: true,
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    const pendingGenre = genre.trim()
    const allGenres = pendingGenre ? genres.concat(pendingGenre) : genres

    try {
      await addBook({
        variables: {
          title,
          author,
          published: Number(published),
          genres: allGenres,
        },
      })
    } catch {
      return
    }

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    const trimmedGenre = genre.trim()
    if (trimmedGenre && !genres.includes(trimmedGenre)) {
      setGenres(genres.concat(trimmedGenre))
    }
    setGenre('')
  }

  return (
    <div>
      <h2>add book</h2>
      <form onSubmit={submit}>
        <label>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            required
          />
        </label>
        <label>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            required
          />
        </label>
        <label>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
            required
          />
        </label>
        <div className="genre-row">
          <label>
            genre
            <input
              value={genre}
              onChange={({ target }) => setGenre(target.value)}
            />
          </label>
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit" disabled={result.loading}>
          create book
        </button>
        {result.error && <p role="alert">could not add book</p>}
      </form>
    </div>
  )
}

export default NewBook
